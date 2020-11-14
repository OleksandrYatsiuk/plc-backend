import { CustomMessage, EMessageTypes, EContentTypes, MessageOptions } from '../../interfaces';
import { Markup, Extra, BaseScene } from 'telegraf';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';
import { Message } from 'telegraf/typings/telegram-types';
import { ApiHelperService } from '../../telegram-bot/request-helper';
import { bot } from '../../telegram-bot/telegram-bot';
import { urls } from '../../telegram-bot/storage/url';

const backend = new ApiHelperService(urls.local.backend)
export const courses_lesson = new BaseScene('lessons');

courses_lesson.enter((ctx: SceneContextMessageUpdate & { session: any }) => {

    const courseId = ctx.match.input.split(':')[1];
    ctx.session.data = { courseId: courseId };
    backend.lessonList({ courseId }).then()
        .then(lessons => {
            ctx.reply('Виберіть  урок', Extra.HTML().markup((m) =>
                m.inlineKeyboard([
                    lessons.map(lesson => m.callbackButton(lesson.name, `lesson:${lesson.id}`))
                ])))
        })

    courses_lesson.action(/lesson:/, (ctx: SceneContextMessageUpdate & { session: any }) => {
        const lessonId = ctx.match.input.split(':')[1];
        ctx.session.data['lesson'] = lessonId;
        backend.lessonDetail(lessonId)
            .then(lesson => {
                ctx.replyWithHTML(lesson.context, Extra.HTML().markup((m) =>
                    m.inlineKeyboard([m.callbackButton('Далі', 'next')])
                ))
            }).catch(e => {
                return ctx.reply(e.response.data.result)
            })

    })

    courses_lesson.action('next', (ctx: SceneContextMessageUpdate & { session: any }) => {
        ctx.reply('Ви можете вписати результати нижче:', Markup
            .keyboard([['Завершити',]])
            .oneTime()
            .resize()
            .extra())

        courses_lesson.on('message', (ctx: SceneContextMessageUpdate & { session: any }) => {
            ctx.session.data['isAddedMessage'] = true;
            const { message } = ctx.update;
            if (message.text == 'Завершити') {
                return ctx.scene.leave();
            } else {
                fetchFile(message, (content: MessageOptions) => {
                    const data: CustomMessage = {
                        chat_id: message.chat.id,
                        lessonId: ctx.session.data.lesson,
                        type: EMessageTypes.user,
                        message: {
                            id: message.message_id,
                            content
                        },
                    }
                    backend.sendMessage(data)
                        .then(result => { })
                        .catch(e => ctx.reply(e.response.data.result));
                })
            }

        })


        courses_lesson.leave((ctx) => {
            ctx.reply('Ваша відповідь була прийнята. Найближчим часом буде зроблена перевірка і надісланий результат:)');
        });
    })
})

function fetchFile(msg: Message, cb: Function): void {
    if (msg.document) {
        getFileLink(msg.document.file_id)
            .then(link => cb({ type: EContentTypes.file, link: link, text: msg.caption, fileId: msg.document.file_id }));
    } else if (msg.photo) {
        getFileLink(msg.photo[0].file_id)
            .then(link => cb({ type: EContentTypes.photo, link: link, text: msg.caption, fileId: msg.photo[0].file_id }));
    } else {
        cb({ type: EContentTypes.text, link: null, text: msg.text, fileId: null })
    }
}

function getFileLink(fileId: string): Promise<string> {
    return bot.telegram.getFileLink(fileId);
}
