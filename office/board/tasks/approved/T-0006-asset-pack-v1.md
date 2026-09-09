# T-0006 — Ասեթ-փաթեթ v1 (3D → 2D bake)

- **Author.** Սևակ (lead)
- **Assignee.** Aram (founder, դիզայներ)
- **Opened.** 2026-09-09
- **Priority.** P1

## Ինչ ա պետք
docs/design/asset-spec.md-ի v1 ցուցակով ասեթների արտադրություն՝ 3D-ով
սարքած, 2D bake-երով հանձնած։ Առաջնահերթությունը սպեցի §5-ով.
հետապնդողի կերպար → շենքերի ֆասադներ + հյուրանոց → մեքենա → billboard-ներ։
«Արված» v1 = հետապնդողը, ≥4 շենք, 1 մեքենա ու 4 billboard խաղի մեջ են,
ընդհանուր ասեթ-ծավալը ≤10MB, ոճը մեկ ընտանիք ա (Պապիի sheet-ի էտալոնով)։

## Կոնտեքստ
Սպեցը՝ docs/design/asset-spec.md (կամերա, ռակուրսներ, չափեր, ձևաչափեր)։
3D source-երը՝ docs/design/src3d/, հանձնումները՝ docs/design/drops/։
Stake-ի կանոնները. օրիգինալ ասեթներ, ոչ մի IP/Stake նշան, consistent art
(docs/stake-engine/approval-guidelines.md)։ Bake pipeline-ը Blender-ով՝
Սևակի հետ միասին։ Դիզայնի թասկերը փակում ա հիմնադիրը (CLAUDE.md)։

## Log
- [2026-09-09] Սևակ. բացվեց asset-spec v1-ի հետ միասին։
