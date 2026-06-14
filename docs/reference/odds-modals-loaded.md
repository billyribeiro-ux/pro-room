# Odds-and-ends modals — DOM extraction

Source: `files/odds-and-ends.html` (Angular 17 full-app snapshot).
Cruft stripped: `_nghost*`, `_ngcontent*`, `ng-star-inserted`, `ng-reflect-*`, empty `<!---->`.

> **IMPORTANT — capture state.** All three modals in this snapshot are in their
> **un-populated** state. Their `modal-body` content is rendered at runtime from
> async data and appears in the snapshot only as Angular `<!---->` comment
> placeholders (and, for two of them, a `fa-spinner` "Loading..." block). The
> real report sections / thread rows / control body are **not present** in this
> DOM dump — they had not resolved at capture time. What follows is the verified
> outer shell (header / body container / footer) for each, plus the inferred
> body contract to rebuild. Do **not** invent report numbers — none exist here.

---

## 1. `app-alert-send-report-modal` → `AlertSendReportModal.svelte`

Lines 118637–118706. **Still "Loading..." — no loaded report sections in this snapshot.**

### Verified markup tree

```
div#alert-send-report-modal.modal.fade[role=dialog][aria-labelledby=alert-send-report-modal][aria-hidden=true][tabindex=-1]
  div.modal-dialog[role=document]
    div.modal-content
      div.modal-header
        h5            "Alert Sent Report. AlertID:"   ← AlertID value appended at runtime (empty here)
        button.btn-close.btn-close-white[data-bs-dismiss=modal][aria-label=Close]
      div.modal-body
        div.text-center.my-4
          h5
            i.ml-2.fas.fa-spinner.fa-spin
            "Loading..."
        <!----><!----><!----><!---->     ← 4 placeholders = the loaded report sections (unrendered)
      div.modal-footer.text-center
        button.btn.btn-secondary[data-bs-dismiss=modal] "Close"
```

### Notes for rebuild
- Title pattern: `Alert Sent Report. AlertID: {alertId}`.
- Body is a single async-loaded region. The **4** `<!---->` placeholders strongly
  imply 4 conditional sections (likely: delivery summary, stats/percent, a
  chart/canvas, recipient breakdown) but their exact markup is NOT in this
  snapshot — earlier captures the user referenced also only had "Loading...".
  This range did **not** resolve to the loaded state.
- Footer: single "Close" button, `data-bs-dismiss`.
- Svelte contract: `open: boolean`, `alertId: string`, async `report` fetch;
  show spinner while pending, render sections on resolve, error toast on reject.

---

## 2. `app-all-user-pmmodal` → `AllUserPmModal.svelte`

Lines 118707–118777. **Still "Loading..." — no thread rows in this snapshot.**

### Verified markup tree

```
div#all-user-pm-modal.modal.fade[role=dialog][aria-labelledby=all-user-pm-modal][aria-hidden=true][tabindex=-1]
  div.modal-dialog[role=document]
    div.modal-content
      div.modal-header
        h5  "All private messages:" <!---->   ← trailing count/name interpolated at runtime
        button.btn-close.btn-close-white[data-bs-dismiss=modal][aria-label=Close]
      div.modal-body
        div.text-center.my-4
          h5
            i.ml-2.fas.fa-spinner.fa-spin
            "Loading..."
        <!----><!---->                          ← 2 placeholders = thread-list region (unrendered)
        div.modal-footer.text-center            ← NOTE: footer nested INSIDE modal-body here
          button.btn.btn-secondary[data-bs-dismiss=modal] "Close"
```

### Notes for rebuild
- Title: `All private messages:` + a runtime suffix (`<!---->`).
- Body: spinner + a 2-placeholder async region for the thread list. The
  per-row structure (who / preview / time) is the natural contract but is
  **not captured** — rows were unrendered.
- Quirk: in this snapshot the `modal-footer` sits inside `modal-body` (Angular
  template nesting). For the Svelte rebuild, place the footer as a sibling of
  the body (standard Bootstrap), not nested.
- Svelte contract: `open`, async `threads: { user, preview, time }[]`,
  spinner while loading, list on resolve.

---

## 3. `app-session-control-modal` → `SessionControlModal.svelte`

Two identical instances: lines 13460–13506 and 117777–117837. **Both have an empty body** (`<!----><!---->`); no controls captured.

### Verified markup tree

```
div#session-control-modal.modal.fade[role=dialog][aria-labelledby=session-control][aria-hidden=true][tabindex=-1]
  div.modal-dialog.modal-lg[role=document]
    div.modal-content
      div.modal-header
        h5#session-control.modal-title  "Session Control"
        button.btn-close.btn-close-white[data-bs-dismiss=modal][aria-label=Close]
      div.modal-body
        <!----><!---->            ← controls region (unrendered)
      div.modal-footer
        button.btn.btn-success.btn-block  "Done"      ← no data-bs-dismiss; likely runs an action then closes
```

### Notes for rebuild
- Wider dialog: `modal-lg`.
- Title: static "Session Control".
- Body: 2-placeholder async/control region — actual controls/buttons NOT in
  snapshot.
- Footer: single full-width success **"Done"** button (`btn-success btn-block`),
  and unlike the others it has **no** `data-bs-dismiss` — implies it triggers a
  handler (apply/save session settings) before closing.
- Svelte contract: `open`, a `Done` handler emitting the chosen session action.
