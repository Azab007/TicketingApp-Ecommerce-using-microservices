import { Listener, Subjects, TicketUpdatedEvent } from "@azabticketing/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated =Subjects.TicketUpdated;
    queueGroupName: string = queueGroupName
    async onMessage(data: TicketUpdatedEvent["data"],msg: Message) {
        const {id,title,price,version} = data
        const ticket = await Ticket.findByEvent(data)
        if (!ticket) {
            throw new Error("Ticket not found")
        }
        ticket.set({title, price})
        await ticket.save()
        msg.ack()
    }
}