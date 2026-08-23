# Truthmark

**وكلاؤك يكتبون الكود. ويحافظ Truthmark على التوثيق الموجّه للبشر والقابل للمراجعة عبر Git.**

يثبّت Truthmark مسارات عمل أصلية لـ Git تتيح لوكلاء البرمجة بالذكاء الاصطناعي إنشاء توثيق جديد للمنتج والهندسة من الكود والاختبارات الموجودة، والحفاظ على حداثته بعد كل تغيير في الكود، وتسليمك فروق Markdown عادية لمراجعتها.

[![إصدار npm](https://img.shields.io/npm/v/truthmark?color=cb3837&label=npm)](https://www.npmjs.com/package/truthmark)
[![CI](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml)
[![الترخيص: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Node.js >=24](https://img.shields.io/badge/node-%3E%3D24-339933?logo=node.js&logoColor=white)](../../package.json)

[ابدأ الآن](#البدء-السريع-أنشئ-أول-وثيقة-حقيقة) · [الموقع](https://merlinhu1.github.io/truthmark/) · [دليل المستخدم](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md) · [GitHub](https://github.com/merlinhu1/truthmark)

<details>
<summary>اقرأ ملف README هذا بـ 16 لغة</summary>

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

</details>

## أنشئ الوثائق الأولى. وحافظ على صدقها.

تتوقف معظم أدوات التوثيق بعد التوليد. أما Truthmark فيمنح الوكلاء دورة حياة كاملة للتوثيق داخل مستودعك:

- **أنشئ توثيقاً جديداً من برمجيات عاملة.** يقرأ Truth Document الكود والاختبارات، ثم ينشئ توثيقاً محدد النطاق للمنتج أو الهندسة.
- **حافظ على توافق الوثائق تلقائياً.** يعمل Truth Sync عند تسليم الوكيل بعد تغييرات الكود الوظيفية، ويحدّث حقيقة المستودع قبل اكتمال العمل.
- **حوّل الوثائق مجدداً إلى كود.** ينفّذ Truth Realize وثائق الحقيقة المعتمدة مع الحفاظ على مسار عمل نظيف يبدأ بالتوثيق.
- **أصلح الملكية مع نمو قاعدة الكود.** ينشئ Truth Structure مسارات محددة النطاق ووثائق أولية للمناطق الجديدة أو المثقلة.
- **راجع كل شيء في Git.** ينتقل الكود والقرارات والعقود والمعمارية والعمليات والسلوك معاً ضمن الفرع.

لا قاعدة معرفة مستضافة. لا ذاكرة خاصة للوكلاء. لا توثيق عالق في سجل المحادثات.

## البدء السريع: أنشئ أول وثيقة حقيقة

**المتطلبات:** Node.js 24 أو أحدث، ومستودع Git، ومضيف برمجة بالذكاء الاصطناعي مدعوم لمسارات عمل الوكلاء.

شغّل ما يلي داخل المستودع الذي تريد أن يديره Truthmark:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark init
```

يتيح لك `truthmark init` اختيار Codex أو Claude Code أو GitHub Copilot أو OpenCode أو Antigravity أو Cursor أو إعداد واجهة سطر أوامر محايد تجاه المضيف.

اطلب الآن من الوكيل الذي أعددته توثيق سلوك حقيقي واحد:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

ينشئ Truth Document وثيقة حقيقة جديدة محددة النطاق عند عدم وجودها، ويحدّث الوثيقة المالكة الموجودة عند وجودها، ويحدّث التوجيه عند الحاجة. ولا يغيّر الكود الوظيفي.

راجع النتيجة:

```bash
truthmark check
git status --short --untracked-files=all
git diff
```

ينبغي أن يصبح لديك الآن:

```text
docs/truthmark/engineering/behaviors/session-timeout.md
docs/truthmark/routes/areas/authentication.md
```

تتبع المسارات الدقيقة بنية الملكية في مستودعك. تظهر الملفات الجديدة في `git status`، وتظهر تغييرات الملفات المتتبعة في `git diff`.

تختلف طريقة الاستدعاء بحسب المضيف. يستخدم OpenCode الأمر `/skill truthmark-document`، ويستخدم Antigravity الأمر `@truthmark-document`، بينما تستخدم المضيفات الأخرى المدعومة واجهتها الأصلية للمهارات أو أوامر الشرطة المائلة. راجع [جدول المنصات](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md#supported-agent-platforms) لمعرفة الأوامر الدقيقة.

بالنسبة إلى السكربتات والتكامل المستمر، مرّر المنصات المختارة صراحةً:

```bash
truthmark init --platform codex --platform cursor
truthmark init --json
```

اختر `none` تفاعلياً أو شغّل `truthmark init --clear-platforms` للحصول على مستودع محايد تجاه المضيف. ويمكنك إضافة منصات الوكلاء لاحقاً بإعادة تشغيل `truthmark init`.

للحصول على تشخيصات الحداثة نسبةً إلى الفرع، مرّر مرجع Git أساسياً:

```bash
truthmark check --base <base-ref>
```

## كيف يعمل Truthmark

<picture>
  <source media="(max-width: 700px)" srcset="../assets/truthmark-workflow-mobile.svg">
  <img src="../assets/truthmark-workflow.svg" alt="كيف يعمل Truthmark" width="1440">
</picture>

تثبّت واجهة سطر أوامر Truthmark عقد المستودع وتتحقق منه. وينفّذ وكيل البرمجة مراجعة الأدلة وأعمال التوثيق من خلال مسارات العمل الأصلية للمضيف التي جرى تثبيتها.

يتبع تغيير الكود المعتاد حلقة بسيطة:

1. يغيّر الوكيل الكود الوظيفي.
2. تُشغّل الاختبارات ذات الصلة.
3. يتحقق Truth Sync من التوثيق المرتبط.
4. ينشئ الوكيل الوثائق والتوجيه أو يحدّثهما عندما تتغير حقيقة المستودع.
5. تراجع فرق الكود وفرق الحقيقة معاً.

## مسارات العمل

| مسار العمل           | متى تستخدمه                                                                | النتيجة                                                          |
| -------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Truth Document**   | يحتاج الكود الموجود إلى توثيق                                              | ينشئ توثيقاً للمنتج والهندسة مدعوماً بالأدلة أو يحدّثه           |
| **Truth Sync**       | تغيّر الكود الوظيفي                                                        | يحافظ على توافق الوثائق المرتبطة والتوجيه قبل التسليم            |
| **Truth Structure**  | تحتاج منطقة جديدة إلى ملكية أو أصبحت الوثائق الموجودة واسعة أكثر من اللازم | ينشئ مسارات محددة النطاق وهياكل أولية للوثائق                    |
| **Truth Realize**    | ينبغي تحويل وثيقة حقيقة معتمدة إلى برمجيات عاملة                           | يحدّث الكود الوظيفي انطلاقاً من التوثيق                          |
| **Truth Check**      | تحتاج حقيقة المستودع إلى تدقيق                                             | يبلّغ عن مشكلات التوجيه والملكية والأدلة والتوثيق                |
| **Truthmark Portal** | يريد الفريق موقع توثيق سهل التصفح                                          | ينشئ عرض HTML ثابتاً وملتزماً به من وثائق الحقيقة بصيغة Markdown |

يثبّت Truthmark مسارات العمل هذه كأسطح أصلية للمستودع في Codex وClaude Code وGitHub Copilot وOpenCode وAntigravity وCursor.

## ما الذي تحصل عليه

### توثيق يبدأ من الواقع

يستطيع Truthmark إنشاء توثيق لقدرات المنتج وسلوك التنفيذ وواجهات برمجة التطبيقات والمعمارية ومسارات العمل والعمليات والاختبارات. يقدّم الكود والاختبارات الأدلة، وتحفظ وثائق Markdown محددة النطاق النتيجة.

### توثيق يصمد أمام التغيير التالي

تربط المسارات مناطق الكود بالوثائق المعتمدة. وعندما يغيّر الوكلاء السلوك، يعرف Truth Sync أين تنتمي الحقيقة المقابلة ويحافظ على قابلية مراجعة التسليم.

### حقيقة المنتج والهندسة في مسارين منفصلين

تسجّل حقيقة المنتج الوعود الموجّهة للمستخدم والحدود والقرارات ومعايير القبول. وتسجّل حقيقة الهندسة السلوك الحالي والعقود والمعمارية ومسارات العمل والعمليات وسلوك الاختبارات.

### تعاون أصلي لـ Git

يعيش كل ما يهم في ملفات المستودع الملتزم بها. تتبع الحقيقة الفرع، وتعمل مع طلبات السحب العادية، وتبقى مرئية لكل صائن ووكيل برمجة.

### تشغيل محلي أولاً

لا يحتاج Truthmark إلى خدمة مستضافة أو برنامج خفي أو قاعدة بيانات أو مخزن متجهات أو خادم Model Context Protocol. يحمل المستودع مسار عمل التوثيق الخاص به.

## أين يندرج Truthmark

| الحاجة                                       | الأنسب                     |
| -------------------------------------------- | -------------------------- |
| مخرجات أفضل من جلسة وكيل واحدة               | مطالبة أفضل                |
| استمرارية شخصية أو على مستوى الجلسة          | أداة ذاكرة                 |
| تطوير ميزات يبدأ بالخطة                      | مسار عمل للمواصفات         |
| توثيق مرتبط بالفرع ينتقل مع الكود            | **Truthmark**              |
| صحة السلوك                                   | الاختبارات ومراجعة الكود   |
| توثيق مدعوم بالذكاء الاصطناعي وقابل للمراجعة | **Truthmark + مراجعة Git** |

صُمّم Truthmark للصائنين وفرق الهندسة التي تستخدم بالفعل وكلاء البرمجة بالذكاء الاصطناعي وتريد أن يواصل المستودع قول الحقيقة بالسرعة نفسها التي يتغير بها الكود.

## المضيفات المدعومة وسطر الأوامر

مضيفات الوكلاء المدعومة:

- Codex
- Claude Code
- GitHub Copilot
- OpenCode
- Antigravity
- Cursor

<details>
<summary>مرجع سطر الأوامر</summary>

| الأمر                                                             | الغرض                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `truthmark init`                                                  | ينشئ الإعدادات والتوجيه والقوالب ومسارات عمل المضيفات المختارة أو يحدّثها |
| `truthmark check [--base <ref>]`                                  | يتحقق من حقيقة المستودع ويشغّل اختيارياً تشخيصات حداثة الفرع              |
| `truthmark index --json`                                          | يفحص بيانات المستودع والتوجيه الوصفية المشتقة                             |
| `truthmark impact --base <ref> --json`                            | يربط الملفات المتغيرة بالوثائق والمالكين والاختبارات القريبة              |
| `truthmark workflow status --workflow <id> [--base <ref>] --json` | يفحص قابلية تطبيق مسار العمل وأهدافه                                      |
| `truthmark validate ...`                                          | يتحقق من تقارير مسارات العمل وتصاريح الكتابة                              |
| `truthmark uninstall --dry-run` / `truthmark uninstall --apply`   | يعاين أسطح المضيف المولّدة أو يزيلها مع الحفاظ على الحقيقة المؤلّفة       |

تتوفر مخرجات JSON منظّمة في جميع أجزاء واجهة سطر الأوامر للسكربتات والتكامل المستمر.

</details>

## اعرف المزيد

- [دليل مستخدم Truthmark](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md)
- [فهرس التوثيق](https://github.com/merlinhu1/truthmark/blob/main/docs/README.md)
- [نظرة عامة على المعمارية](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/architecture/overview.md)
- [عقود الإعداد والتوجيه والأوامر](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [صيانة حقيقة المستودع](https://github.com/merlinhu1/truthmark/blob/main/docs/repo/standards/maintaining-repository-truth.md)
- [المساهمة](https://github.com/merlinhu1/truthmark/blob/main/CONTRIBUTING.md)

**ثبّت Truthmark، واختر مضيف البرمجة، وحوّل سلوكاً حقيقياً إلى توثيق اليوم.**

## الترخيص

MIT. راجع [LICENSE](../../LICENSE).
