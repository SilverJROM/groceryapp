const { Telegraf, Markup } = require("telegraf")
const dotenv = require("dotenv")
const fs = require("fs")

//load environment variables
dotenv.config()

const botToken = process.env.BOT_TOKEN
const databaseFile = "grocery.json"

let groceryData = {}
if (fs.existsSync(databaseFile)) {
    const data = fs.readFileSync(databaseFile, "utf-8")
    groceryData = JSON.parse(data)
}

//new instance of the telegraf bot
const bot = new Telegraf(botToken)

//start command handler
bot.command("start", (ctx) => {
    const startText =
        "Welcome to the grocery app, where you can list items you want to buy on your next visit to the store"

    ctx.reply(startText)
})

//guide command handler
bot.command("guide", (ctx) => {
    const guideText = "None Yet"

    ctx.reply(guideText)
})

//help command handler
bot.command("help", (ctx) => {
    const helpText =
        "Here are the available commands:\n\n" +
        "/start - start app\n" +
        "/guide - guide on how to use app\n" +
        "/help - list available commands\n\n" +
        "Grocery List commands:\n" +
        "/additem - add items to the list\n" +
        "/delete - delete item from the list\n" +
        "/list - list all items on your current list\n" +
        "/bought - buy items from the list and create a new list\n" +
        "/prvlists - list items previously bought\n"
    ctx.reply(helpText)
})

//add item
bot.command("additem", (ctx) => {
    const chatId = ctx.chat.id
    const items = ctx.message.text.split(" ").slice(1).join(" ").split(",")

    const timestamp = new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    })

    if (!groceryData[chatId]) groceryData[chatId] = { current: {} }
    if (!groceryData[chatId].current[timestamp])
        groceryData[chatId].current[timestamp] = { items: [] }
    if (!Array.isArray(groceryData[chatId].current[timestamp].items))
        groceryData[chat].current[timestamp].items = []

    groceryData[chatId].current[timestamp].items.push(...items)
    saveData()
    ctx.reply(`${items.join(", ")} added to the list`)
})

//delete item
bot.command("delete", (ctx) => {
    const chatId = ctx.chat.id
    const currentList = groceryData[chatId].current

    if (Object.keys(currentList).length === 0) {
        ctx.reply("The current list is empty.")
    } else {
        const keyboard = Markup.inlineKeyboard(
            Object.entries(currentList).flatMap(([date, entry]) =>
                entry.items.map((item) => Markup.button.callback(item, `delete_${date}_${item}`)),
            ),
        )
        ctx.reply("Select an item to delete:", keyboard)
    }
})

//list items
bot.command("list", (ctx) => {
    const chatId = ctx.chat.id

    if (!groceryData[chatId] || !groceryData[chatId].current) {
        ctx.reply("The current list is empty!")
    } else {
        const currentList = groceryData[chatId].current
        let message = "Grocery List (current): \n"

        for (const [date, entry] of Object.entries(currentList)) {
            const items = entry.items

            if (Array.isArray(items) && items.length > 0) {
                message += `${date}: \n`
                for (const item of items) {
                    message += `- ${item}\n`
                }
            }
        }

        ctx.reply(message)
    }
})

//bought
bot.command("bought", (ctx) => {
    const chatId = ctx.chat.id

    if (!groceryData[chatId] || !groceryData[chatId].current) {
        ctx.reply("List is empty")
    } else {
        const boughtDate = new Date().toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        })

        groceryData[chatId][`bought @${boughtDate}`] = groceryData[chatId].current
        groceryData[chatId].current = {}
        saveData()
        ctx.reply("current list marked as bought")
    }
})

//previous lists
bot.command("prvlists", (ctx) => {
    const chatId = ctx.chat.id

    if (!groceryData[chatId] || Object.keys(groceryData[chatId]).length === 0) {
        ctx.reply("No list for user")
    } else {
        const previousLists = Object.entries(groceryData[chatId])
            .filter(([key]) => key !== "current")
            .map(([key, list]) => {
                if (key.startsWith("bought @")) {
                    const boughtDate = key.substring(8)
                    return { boughtDate }
                }
            })
            .filter(Boolean)

        const keyboard = Markup.inlineKeyboard(
            previousLists.map((list, index) =>
                Markup.button.callback(list.boughtDate, `list_${index}`),
            ),
        )

        ctx.reply("Previous Grocery lists:", keyboard)
    }
})

//callback
bot.on("callback_query", async (ctx) => {
    const callbackData = ctx.callbackQuery.data
    const chatId = ctx.chat.id

    if (callbackData.startsWith("list_")) {
        const listIndex = parseInt(callbackData.substring(5))
        const previousLists = Object.entries(groceryData[chatId])
            .filter(([key]) => key !== "current")
            .map(([key, list]) => {
                if (key.startsWith("bought @")) {
                    const boughtDate = key.substring(8)
                    const items = Object.entries(list)
                        .map(([date, entry]) => entry.items)
                        .join("\n")
                    return { boughtDate, items }
                }
            })
            .filter(Boolean)

        const selectedList = previousLists[listIndex]

        if (selectedList) {
            ctx.reply(
                `Grocery List (${selectedList.boughtDate}):\n- ${selectedList.items.replace(
                    /\n/g,
                    "\n-",
                )}`,
            )
        } else {
            ctx.reply("Invalid Selection")
        }
    }

    if (callbackData.startsWith("delete_")) {
        const [itemId, itemName] = callbackData.substring(7).split("_")
        const currentList = groceryData[chatId].current[itemId]

        if (!currentList || !currentList.items || !currentList.items.includes(itemName)) {
            ctx.reply("The item does not exists on the list")
        } else {
            currentList.items = currentList.items.filter((item) => item !== itemName)
            saveData()
            ctx.reply("Item has been deleted from the list")
        }
    }
})

//save data on json file
function saveData() {
    fs.writeFileSync(databaseFile, JSON.stringify(groceryData, null, 2))
}

//start bot
bot.launch().then(() => {
    console.log("App is running...")
})
