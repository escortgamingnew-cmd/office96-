# Օֆիսի օնլայն շերտը (Claude artifacts)

Երկու հրապարակված էջ՝ հիմնադրի Claude հաշվի տակ (private, մինչև սեփական սերվերը).

| Ինչ | Լինկ | Աղբյուր |
|---|---|---|
| Խաղը (pixi-feel bundle) | https://claude.ai/code/artifact/c907fbe5-f890-43f3-9e2c-a0631987f0d9 | `prototype/pixi-feel/` → `build-artifact.ps1` |
| Չաթը (Օֆիս 96) | https://claude.ai/code/artifact/b1fca2be-0d78-425a-ac14-d17d08f65efb | `office/chat/*.md` → `build-chat.ps1` + `chat-template.html` |

## Ինչպես ա աշխատում չաթը

- Արխիվը (md ֆայլերը) build-ի պահին ներդրվում ա էջի մեջ ստատիկ։
- Նոր գրառումները էջից գնում են artifact-ի db՝ `channels/<ch>/messages`
  կոլեկցիաներ, դաշտերը՝ `{author, ts, text, src:"web"}`։
- **Սինքի ծեսը (Սևակ, ամեն արթնացում).** կարդալ db-ի `src:"web"`
  գրառումները (Artifact read_db), append անել համապատասխան md ֆայլերին,
  commit, հետո db-ում դրանց `src`-ը դարձնել `"synced"` (կամ ջնջել) ու
  `build-chat.ps1`-ով վերահրապարակել էջը՝ նույն URL-ով։
- Ֆայլերը մնում են ճշմարտությունը. db-ն միջանկյալ փոստարկղ ա։

## Build

```powershell
# խաղը (scratchpad-ից փոխի ելքի ճամփան ըստ պահանջի)
powershell -File tools/office/online/build-artifact.ps1
# չաթը
powershell -File tools/office/online/build-chat.ps1
```

Երկուսի ելքն էլ մեկ self-contained HTML ա — վերահրապարակվում ա
Artifact գործիքով նույն URL-ի վրա (կամ ապագայում՝ մեր սերվերին)։

Ստեղծված՝ 2026-09-09, Սևակ (հիմնադրի «օնլայն լինկ» խնդրանքով)։
