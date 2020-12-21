import * as TelegramBot from 'node-telegram-bot-api';
export class TelegramService {
    constructor() {

    }
    public telegram = new TelegramBot(process.env.BOT_TOKEN);
}