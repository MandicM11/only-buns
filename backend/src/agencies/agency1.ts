import amqp from 'amqplib';
import { Message } from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE_NAME = 'promoted_posts';

async function startAgency() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: false });
  const q = await channel.assertQueue('', { exclusive: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, '');

  console.log('Agency1 is waiting for promoted posts...');

  channel.consume(q.queue, (msg: Message | null) => {
    if (msg) {
      const data = JSON.parse(msg.content.toString());
      console.log('[Agency1] Promoted post received:', data);
    }
  }, { noAck: true });
}

startAgency().catch(console.error); 