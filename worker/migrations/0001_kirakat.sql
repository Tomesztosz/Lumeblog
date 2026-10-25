-- Kirakat hírlevél: feliratkozók és kiküldési napló.
-- Futtatás: npx wrangler d1 migrations apply lume-kirakat --remote

CREATE TABLE IF NOT EXISTS subscribers (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  email            TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  lang             TEXT    NOT NULL CHECK (lang IN ('hu', 'en')),
  status           TEXT    NOT NULL CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  confirm_hash     TEXT,
  confirm_expires  INTEGER,
  last_mail_at     INTEGER,
  consent          TEXT,
  created_at       INTEGER NOT NULL,
  confirmed_at     INTEGER,
  unsubscribed_at  INTEGER
);

CREATE INDEX IF NOT EXISTS subscribers_status_lang ON subscribers (status, lang);

-- Melyik szám kinek ment ki. Ettől folytatható a küldés több napon át.
CREATE TABLE IF NOT EXISTS deliveries (
  issue          TEXT    NOT NULL,
  subscriber_id  INTEGER NOT NULL,
  sent_at        INTEGER NOT NULL,
  provider_id    TEXT,
  PRIMARY KEY (issue, subscriber_id)
);
