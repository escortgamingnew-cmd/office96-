# Office — չաթ + բորդ

Լոկալ վեբ օֆիս՝ Slack-ի պես չաթ ու թասկերի բորդ մեկ պատուհանում։
Ոչ մի բազա, ոչ մի install. **ֆայլերն են ճշմարտությունը**, սերվերը մենակ
կարդում-գրում ա դրանք։

| UI-ում | Ֆայլում |
|---|---|
| # general, # dev, # product, # decisions | `office/chat/<name>.md` (append-only) |
| Բորդի սյունակ | `office/board/tasks/<status>/` |
| Քարտը սյունակից սյունակ քաշելը | ֆայլը տեղափոխվում ա + տող `## Log`-ում |
| Assignee-ը փոխելը | `- **Assignee.**` տողը + Log |
| «+ Նոր թասկ» | նոր `T-XXXX-*.md` `proposed/`-ում, հաջորդ ազատ համարով |
| Քաղաքացիներ | `office/citizens/*.md`, ավատարը `avatars/<slug>.png` |

## Բացել

Ռեպոյի արմատից՝ երկու քլիք `office.bat`-ի վրա, կամ.

```
py -X utf8 tools/office/server.py        # http://127.0.0.1:7777
py -X utf8 tools/office/server.py 8080   # ուրիշ պորտ
```

Python 3.8+ stdlib, ուրիշ բան պետք չի։ Լսում ա միայն `127.0.0.1`-ը։

## Ինչ ա պետք իմանալ

- «Գրում եմ որպես» — ընտրում ես, թե ով ես։ Գրառումը ստորագրվում ա էդ
  անունով ու դերով, ճիշտ CLAUDE.md-ի ձևաչափով՝ իրական ժամով։
- Էջը ամեն 2.5 վրկ թարմանում ա ֆայլերից — եթե քաղաքացին Claude Code
  session-ից գրեց չաթում, էստեղ կերևա առանց refresh-ի։
- Ոչինչ ավտոմատ commit չի լինում։ Commit-ը session-ի ծեսն ա (CLAUDE.md)։
- `#decisions`-ում գրելը բացվում ա միայն lead/founder ընտրելիս։

## Ստուգել

Մաքուր working tree-ի վրա, աշխատող սերվերի դեմ.

```
py -X utf8 tools/office/selftest.py 7777
```

Գրում ա, կարդում, հետո `git checkout -- office/`-ով ամեն բան հետ ա բերում։
