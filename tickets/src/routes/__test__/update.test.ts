import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'aslkdfj',
      price: 20,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'aslkdfj',
      price: 20,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set("Cookie",global.signin())
    .send({
      title: "ksdfklsdf",
      price: 10
    })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: "asddddasa",
      price: 1000
    })
    .expect(401)

});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin()
  const response = await request(app)
  .post('/api/tickets')
  .set("Cookie",cookie)
  .send({
    title: "ksdfklsdf",
    price: 10
  })
  .expect(201)

await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: "",
    price: 1000
  })
  .expect(400)

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: "asdasd",
    price: -1000
  })
  .expect(400)
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signin()
  const response1 = await request(app)
  .post('/api/tickets')
  .set("Cookie",cookie)
  .send({
    title: "ksdfklsdf",
    price: 10
  })
  .expect(201)

const response2 = await request(app)
  .put(`/api/tickets/${response1.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: "asdasd",
    price: 1000
  })
  .expect(200)

  expect(response2.body.title).toEqual("asdasd")
  expect(response2.body.price).toEqual(1000)
});
