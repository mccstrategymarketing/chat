import {
    CHAT,
    TEMPLATE,
    CONTROL,
    SETTINGS,
    SERVER,
    STOREGE
}
from "/js/view.js";
import {
    format
}
from "date-fns"
import Cookies from "js-cookie";


const SOCKET = new ConnectSocket();

function ConnectSocket() {
    this.sendMessage = (text) => this.socket.send(JSON.stringify({
        text
    }));

    this.checkMessage = () => this.socket.addEventListener("message", this.renderMessage);

    this.renderMessage = (e) => {
        const message = new NewMessage(JSON.parse(e.data));
        message.prependItem(CHAT.VIEW);
        scrollToBottom();
    };

    this.checkClose = () => {
        this.socket.addEventListener("close", e => {
            if (e.wasClean) {
                console.log(`[close] Соединение закрыто чисто, код=${e.code} причина=${e.reason}`);
            } else {
                console.log("[close] Соединение прервано");
                const token = Cookies.get('token');
                this.init(token);
            }
        })
    }

    this.init = (token) => {
        this.socket = new WebSocket(`${SERVER.SOCKET}${token}`);
        this.checkMessage();
        this.checkClose();
    };
    this.disconnect = () => {
        this.socket.close(1000, "Работа закончена");
    };
};


initChat();




CONTROL.SETTINGS.addEventListener("click", () => {
    Cookies.get("token") ? SETTINGS.CHANGE_NAME.BLOCK.classList.add("active") :
        SETTINGS.CREATE.BLOCK.classList.add("active")
});

CHAT.FORM.addEventListener("submit", sendMessage);

SETTINGS.CREATE.FORM.addEventListener("submit", sendEmail);
SETTINGS.AUTH.FORM.addEventListener("submit", sendAuth);
SETTINGS.CHANGE_NAME.FORM.addEventListener("submit", changeName);

CONTROL.BTN_CLOSE.forEach(element => {
    element.addEventListener("click", (e) => {
        e.target.closest(".block").classList.remove("active");
    })
});

CONTROL.LOG_OUT.addEventListener("click", () => {
    Cookies.remove("token");
});


CHAT.VIEW.addEventListener("scroll", renderMessageOnScrollThrottle);

function renderMessageOnScrollThrottle(e) {
    const positionScroll = CHAT.VIEW.scrollTop - CHAT.VIEW.offsetHeight;
    const threshold = positionScroll + CHAT.VIEW.scrollHeight <= 66;
    threshold ? renderMessages() : false
}


function sendEmail(e) {
    e.preventDefault();
    const {
        value
    } = SETTINGS.CREATE.INPUT;
    validEMail(value) ? requestEmail(value) : alert("Try valid email");
}


function validEMail(mail) {
    const regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexp.test(String(mail).toLocaleLowerCase());
}


async function requestEmail(mail) {
    const response = await fetch(SERVER.USER_URL, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            email: `${mail}`
        })
    });
    if (response.status == 200) {
        alert("Check you email")
        SETTINGS.CREATE.BLOCK.classList.remove("active")
        SETTINGS.AUTH.BLOCK.classList.add("active")
    } else {
        alert(`Code server error:${response.status}`)
    }

};

async function sendAuth(e) {
    e.preventDefault();
    const {
        value
    } = SETTINGS.AUTH.INPUT;
    await validAuth(value) ? SETTINGS.AUTH.BLOCK.classList.remove("active") : alert("Invalid code");
};

async function validAuth(token = Cookies.get("token")) {
    const response = await fetch(SERVER.INFO_URL, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const result = response.json()
    return response.status == 200 ? result : false

}

async function changeName(e) {
    e.preventDefault();
    const {
        value
    } = SETTINGS.CHANGE_NAME.INPUT;
    const token = Cookies.get("token");
    const response = await fetch(SERVER.USER_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        method: "PATCH",
        body: JSON.stringify({
            name: value
        }),
    })

    if (response.status == 200) {
        alert("Chat name change")
    } else {
        console.log("Error " +
            response.status);
    }

}




async function getUserInfo(token = Cookies.get("token")) {
    const response = await fetch(SERVER.INFO_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
    if (response.ok) {
        const res = await response.json();
        STOREGE.EMAIL = res.email;
        return true;
    }
}







class NewMessage {
    constructor({
        text,
        user: {
            email,
            name
        },
        _v,
        updatedAt,
        createdAt,
        id
    }) {
        this.email = email;
        this.text = text;
        this.name = name || STOREGE.USER;
        this.time = createdAt || getTime(new Date());

        // console.log(text, name, email,
        //     createdAt);
    }
    createMessage() {
        this.newMessageItem = TEMPLATE.ITEM.content.cloneNode(true);
        this.blockItem = this.newMessageItem.querySelector(".item-message");
        this.messageItem = this.newMessageItem.querySelector(".show-text");
        this.itemChatName = this.newMessageItem.querySelector(".whois")

        this.time = format(new Date(), "HH:mm");
        this.timeItem = this.newMessageItem.querySelector(".time");
        this.blockItem.classList.add(this.email == STOREGE.EMAIL ? "me" : "oponent");

        this.itemChatName.innerText = this.name;
        this.messageItem.innerText = this.text;
        this.timeItem.innerText = this.time;

        return this.newMessageItem
    }

    appendItemMessage = (element) => element.append(this.createMessage());

    prependItem = (element) => element.prepend(this.createMessage());

}



async function initChat() {
    if (!getUserInfo()) return alert("Вы неавторизованы")
    const response = await fetch(SERVER.HISTORY)
        .then(res => res.json()).then(({
            messages
        }) => {
            STOREGE.ARR_MESSAGE = messages;
            renderMessages(messages);
            const token = Cookies.get('token');
            SOCKET.init(token);
        });
};

function renderMessages(messages) {

    for (let i = STOREGE.START; i < STOREGE.END; i++) {
        // console.log(STOREGE.ARR_MESSAGE[STOREGE.ARR_MESSAGE.length - [i]])
        const onceMessage = new NewMessage(STOREGE.ARR_MESSAGE[STOREGE.ARR_MESSAGE.length - [i]])
        onceMessage.createMessage();
        onceMessage.appendItemMessage(CHAT.VIEW);
    }
    STOREGE.START += 4;
    STOREGE.END += 4;
}






function sendMessage(e) {
    e.preventDefault();
    const {
        value
    } = CHAT.INPUT;
    // console.log(value);
    if (!value) return;
    SOCKET.sendMessage(value);
    CHAT.FORM.reset()
};


function scrollToBottom() {
    const element = CHAT.VIEW.firstElementChild;
    const options = {
        block: "end",
        behavior: "smooth"
    };
    element.scrollIntoView(options);
}