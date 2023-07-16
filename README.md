# Grocery App Telegram Bot

This Telegram bot allows you to manage your grocery shopping list right from your chat. You can add items, delete items, list the current items on your list, mark items as bought, and view previous shopping lists.

## Prerequisites

Before running the bot, make sure you have the following:

-   Node.js installed
-   Telegram bot token (obtainable from BotFather on Telegram)

## Installation

1. Clone this repository:

```sh
git clone https://github.com/your-username/grocery-app-telegram-bot.git
```

2. Navigate to the project directory:

```sh
cd grocery-app-telegram-bot
```

3. Install the dependencies:

```sh
npm install
```

4. Create a `.env` file in the project directory and add your bot token:

```sh
BOT_TOKEN=your-bot-token
```

5. Start the bot:

```sh
npm start
```

## Usage

Once the bot is running, you can interact with it using the following commands:

-   `/start` - Start the app and get a welcome message.
-   `/guide` - Get a guide on how to use the app (coming soon).
-   `/help` - List all available commands and their descriptions.
-   `/additem item1, item2, ...` - Add items to your shopping list.
-   `/delete` - Delete an item from your shopping list.
-   `/list` - View the current items on your shopping list.
-   `/bought` - Mark the current items as bought and create a new list.
-   `/prvlists` - View previous shopping lists.

## Contributing

Contributions are welcome! If you find any bugs or want to add new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

-   This bot was created using the [Telegraf](https://telegraf.js.org/) library.
-   Thanks to [BotFather](https://core.telegram.org/bots#botfather) for providing the Telegram bot platform.

---

Feel free to customize and enhance the README file according to your project's needs.
