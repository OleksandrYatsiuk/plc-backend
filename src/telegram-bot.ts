import Telegraf from 'telegraf';
import { Markup, Extra, Stage, session, Composer } from 'telegraf';
import * as  WizardScene from 'telegraf/scenes/wizard';
import * as axios from 'axios';
const file = require('../data.json');
const bot = new Telegraf(process.env.BOT_TOKEN);
const link = 'https://lesson-frontend.herokuapp.com';
const apiUrl = 'https://lesson-backend.herokuapp.com/api/v1';

bot.telegram.deleteWebhook().then(success => {
    success && console.log('🤖 is listening to your commands');
    bot.startPolling();
})


bot.start(ctx => {
    if (ctx['startPayload']) {
        axios.default.patch(apiUrl + '/users/current', { phone: "+" + ctx['startPayload'], chat_id: ctx.chat.id });
    }
    return ctx.reply('Main menu', Markup
        .keyboard([
            ['🔍 Про нас', '👨‍🎓 Курси'], // Row1 with 2 buttons
            ['☸ Результати', '📞 Контакти'], // Row2 with 2 buttons
            ['💰 Оплата'], // Row2 with 2 buttons
        ])
        .oneTime()
        .resize()
        .extra())
})

bot.hears('🔍 Про нас', ctx => {
    ctx.reply(file.about);
})
bot.hears('☸ Результати', ctx => {
    ctx.reply(file.result);
})
bot.hears('👨‍🎓 Курси', (ctx, next) => {
    return ctx.reply('Виберіть курс',
        Markup.keyboard([
            ['Course 1', 'Course 2'],
        ])
            .oneTime()
            .resize()
            .extra()
    )
})
bot.hears('Course 1', (ctx) => {
    ctx.reply('Виберіть урок', Markup.keyboard([
        Markup.callbackButton('/lesson', '/lesson'),
        Markup.callbackButton('/lesson', '/lesson')
    ]).extra())
})



bot.hears('💰 Оплата', ctx => {
    return ctx.reply('Practical Legal Courses – школа нового формату', Extra.HTML().markup((m) =>
        m.inlineKeyboard([
            m.urlButton('Оплатити', `${link}/payment?chat_id=${ctx.chat.id}&courseId=1`),
        ])))
});


const superWizard = new WizardScene(
    'lesson-stepper',
    ctx => {
        ctx.reply('Вписати свою відповідь');
        ctx.wizard.state.data = {};
        return ctx.wizard.next();
    },
    ctx => {
        console.log(ctx.update)
        ctx.reply('Додати ще коментарій чи файл?', Markup.inlineKeyboard([
            Markup.callbackButton('No', 'no'),
            Markup.callbackButton('Yes', 'yes')
        ]).extra())
        return ctx.wizard.next()
    },
    ctx => {
        if (ctx.update.callback_query.data == 'yes') {
            ctx.reply('Write comment here:');
            return ctx.wizard.next();
        } else {
            return ctx.scene.leave();
        }
    },
    ctx => {
        bot.telegram.getFileLink(ctx.update.message.photo[0].file_id).then(url => console.log(url))
        ctx.wizard.state.data.phone = ctx.update.message.photo;
        ctx.reply(`Your name is ${JSON.stringify(ctx.wizard.state.data.phone)}`);
        return ctx.scene.leave();
    }
);

bot.hears('📞 Контакти', (ctx) => {
    ctx.replyWithMarkdown(`Open: [Contacts](${link})`);
})


const stage = new Stage([superWizard]);
bot.use(session());
bot.use(stage.middleware());
bot.command('lesson', ctx => {
    ctx.reply('Тут буде інформація на урок...');
    ctx['scene'].enter('lesson-stepper');
});