import express, {Request,Response} from 'express'
import {validateRequest, requireAuth, NotFoundError, BadRequestError, OrderStatus} from '@azabticketing/common'
import { body } from 'express-validator'
import { Ticket } from '../models/Ticket'
import { Order } from '../models/Order'
import { OrderCreatedPublisher } from '../events/publisherss/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()
const EXPIRATION_WINDOW_SEC = 1*60
router.post('/api/orders',requireAuth,
[
    body("ticketId").not().isEmpty().withMessage("ticket id must be provided")
],validateRequest
,
async (req: Request,res: Response) => {
    const {ticketId} = req.body
    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
        throw new NotFoundError()
    }
    const isReserved = await ticket.isReserved()
    if (isReserved) {
        throw new BadRequestError("ticket is reserved")
    }
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SEC)
    
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket
    })
    await order.save()
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        version: order.version,
        expireAt: order.expiresAt.toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price,
        }
    })

    res.status(201).send(order)
})
export {router as newOrderRouter}