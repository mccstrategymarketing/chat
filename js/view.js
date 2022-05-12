export const CHAT = {
    FORM: document.querySelector(".form-message"),
    INPUT: document.querySelector(".input-message"),
    BUTTON: document.querySelector(".enter-message"),
    VIEW: document.querySelector(".view-chat"),
}

export const TEMPLATE = {
    ITEM: document.querySelector("template"),
    ITEM_MESSAGE: document.querySelector('.item-message'),
}
export const CONTROL = {
    SETTINGS: document.querySelector(".settings"),
    LOG_OUT: document.querySelector('.log-out'),
    BTN_CLOSE: document.querySelectorAll(".btn-close")
}

export const SETTINGS = {
    CREATE: {
        BLOCK: document.querySelector(".block.create"),
        FORM: document.querySelector('.form.create'),
        INPUT: document.querySelector(".input.create")
    },
    AUTH: {
        BLOCK: document.querySelector(".block.autorization"),
        FORM: document.querySelector('.form.autorization'),
        INPUT: document.querySelector(".input.autorization")
    },
    CHANGE_NAME: {
        BLOCK: document.querySelector(".block.chahge-name"),
        FORM: document.querySelector('.form.chahge-name'),
        INPUT: document.querySelector(".input.chahge-name")
    }
}
export const SERVER = {
    USER_URL: "https://mighty-cove-31255.herokuapp.com/api/user",
    INFO_URL: "https://mighty-cove-31255.herokuapp.com/api/user/me",
    HISTORY: "https://mighty-cove-31255.herokuapp.com/api/messages",
    SOCKET: "wss://mighty-cove-31255.herokuapp.com/websockets?",
};

export const STOREGE = {
    USER: "Я",
    ARR_MESSAGE: [],
    START: 1,
    END: 20,
}