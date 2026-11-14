# HR dashboard journeys test site

A small, made-up HR dashboard ("Pinecrest HR") for trying browser journeys on something busier than a to-do app.
Plain HTML, CSS and JavaScript: no build step, no network calls. Everything is kept in the browser's
`localStorage`, so each browser has its own copy of the data.

- Public copy: https://pristine-test-org.github.io/hr-dashboard-journeys/
- Run it locally: `python3 -m http.server 5190 --directory .` then open http://localhost:5190/

## Test logins

| Username | Password | Who |
| -- | -- | -- |
| `admin` | `demo-admin` | Nurul Huda, HR admin |
| `dana` | `demo-dana` | Dana Ortiz, team manager |

Both can do everything. They are written on the sign-in page too. They are fake and only work in this site.

## Pages

| Page | What's on it |
| -- | -- |
| `index.html` (`/`) | Sign-in: username, password, a **Sign in** button, the test logins, and **Reset demo data**. Signed in already? It sends you to People. |
| `people.html` | 12 seeded people with initials avatars, a search box, a review-status colour per person, **Export CSV** and **Add person**. |
| `person.html?id=p01` | One profile: photo, title, email, department, start date, review colour, **Send welcome email** and **Edit profile**. |
| `add.html` | Add a new hire: name, work email, job title, department dropdown, start date, review, and a profile photo. |
| `edit.html?id=p01` | Edit profile: the same form, filled in. |
| `reports.html` | Shows a loading spinner, then a fake **500 Internal Server Error**. |

Every page except sign-in sends you to sign-in when you're signed out, and back to where you were after you sign in
(`index.html?next=…`). The side nav has **Sign out** and **Reset demo data**. Below 640 px wide the side nav folds into
a **Menu** button in the top bar.

Seeded ids are `p01` to `p12`. New people get ids like `pm3x9k2a`.

## Photos

The add and edit forms take a photo two ways:

- a file picker, `<input type="file" accept="image/*" id="photo-input">`;
- a separate drag-and-drop box, `#dropzone` ("Or drop a photo here"). It is not a label for the picker, so a drop has to
  land on the box itself. It reads `dataTransfer.files[0]`.

Either way you get a round preview straight away. The photo is cropped square, shrunk to 256 px and kept as a JPEG data
URL when you press **Save**. Non-images are refused with a message.

## Form checks

The forms use `novalidate` and show their own messages under each field, plus a summary at the top
("2 things to fix before saving."):

- full name: at least 2 characters;
- work email: required, must look like an email, and must not belong to someone else (try `ahmad.faiz@example.com`);
- job title: required;
- department: required;
- start date: required, and at most a year from today.

## Traps and snags (on purpose)

| What | Where | What it tests |
| -- | -- | -- |
| Status told apart **only by colour** | People list and profile, the "Review" pill | The pill has no text, title or label. Red = Overdue (`#d93025`), green = On track (`#1e9e57`), amber = Pending (`#f2a900`). Only a legend above the table says which is which. Can a journey (or a colour-blind person) tell who is overdue? |
| Tiny light-grey help text | Under the start date and the photo on add/edit; under the People table | 11 px, `#c8ccd3` on white. Easy to miss, hard to read. Does the vision step notice it? |
| Low-contrast button | **Send welcome email** on a profile | Pale grey text on a pale grey button. It works (shows "Welcome email sent to …"). Is it seen as a button? |
| A button that does nothing | **Export CSV** on People | No download, no message, nothing. Does the journey notice nothing happened? |
| A page that fails | **Reports** | Always ends in a fake 500 after a short spinner. **Try again** fails again. Does the journey report it and move on? |
| Sign-in page | `/` | The only page with a password field, so a journey's sign-in pause should trigger here and nowhere else. |

## Good journeys to try

- Add a new hire with a photo (picker or drop box).
- Find Priya Sharma and change her department.
- Who is overdue for a review?
- Look at the reports.
- Use it on a phone: open the menu, add someone.

## Reset

**Reset demo data** (sign-in page and side nav) puts the 12 seeded people back and removes anything added or edited.
Signing out keeps the data. Clearing the site's storage does both.

All names are made up, emails use `example.com`, and avatars are drawn initials or shapes. No real people or photos.
