import moment from "moment";

const MAX_SESSION_LIFE = 7 * 23 + 1; // max duration 1 week minus 1 hour

interface Session {
    login: string,
    createdAt: moment.Moment,
}

let sessionStorage_: Map<string, Session> = new Map();

export class SessionStorage {
    static deleteSession(token: string): void {
        console.log("Session deleted token=" + token);
        delete sessionStorage_[token];
    }

    static createSession(login: string): string {
        const token: string = Math.random().toString(36).substring(2, 15)
            + Math.random().toString(36).substring(2, 15);
        sessionStorage_.set(token, {
            login: login,
            createdAt: moment(),
        });
        console.log("Session created for " + login + "; token=" + token);
        return token;
    }

    static checkValid(token: string) {
        if (sessionStorage_.has(token)) {
            const ses: Session = sessionStorage_.get(token);

            if (moment().diff(ses.createdAt, 'hours') < MAX_SESSION_LIFE) {
                return true;
            }

            // delete expired session; TODO: Delete all expired, not just from checkValid
            this.deleteSession(token);
            return false;
        }
        return false;
    }
}
