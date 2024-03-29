import { Listener, Subjects, OrderCancelledEvent, OrderStatus } from "@azabticketing/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCancelleddListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled =Subjects.OrderCancelled;
    queueGroupName: string = queueGroupName
    async onMessage(data: OrderCancelledEvent["data"],msg: Message) {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version-1
        })
        if(!order) {
            throw new Error("order not found")
        }
        order.set({
            status: OrderStatus.Cancelled
        })
        await order.save()
        msg.ack()
    }
}