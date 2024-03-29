import express, {Request,Response} from 'express'
import { body } from 'express-validator'
import {requireAuth, validateRequest} from '@azabticketing/common'
import { Ticket } from '../models/Ticket'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'
import { natsWrapper } from '../nats-wrapper'
const router = express.Router()

router.post('/api/tickets',requireAuth,[
    body("title").not().isEmpty().withMessage("Title shouldn't be empty"),
    body("price").isFloat({gt: 0}).withMessage("price should be more than 0")
],validateRequest ,async (req: Request,res: Response) => {
    const {title,price} = req.body
    const ticket = Ticket.build({title,price,userId:req.currentUser!.id})
    await ticket.save()
    new TicketCreatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    })
    res.status(201).send(ticket)
})
export {router as createTicketRouter}