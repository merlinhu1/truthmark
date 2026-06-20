# Truthmark

**Các tác tử của bạn viết mã. Truthmark duy trì tài liệu hướng tới con người và có thể được xem xét qua Git.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

![Biểu ngữ Truthmark](../assets/truthmark-banner.png)

## 🚀 Bắt đầu nhanh: chạy cục bộ trong năm phút

Chạy lệnh này bên trong kho Git mà bạn muốn Truthmark quản lý:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

Bật máy chủ AI mà bạn thực sự sử dụng. Cấu hình mới không gắn với máy chủ nào, vì vậy hãy thêm danh sách `platforms` ở cấp cao nhất vào `.truthmark/config.yml` trước khi khởi tạo:

```yaml
version: 2
platforms:
  - codex        # or: claude-code, github-copilot, opencode, antigravity, cursor
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: false
```

Sau đó cài đặt tài liệu sự thật cục bộ của kho, định tuyến và các bề mặt quy trình làm việc cho tác tử:

```bash
truthmark init
truthmark check
git diff
```

Bây giờ hãy thử lộ trình áp dụng phổ biến nhất: ghi tài liệu cho một hành vi hiện có từ mã và kiểm thử. Trong máy chủ lập trình AI của bạn, hãy yêu cầu quy trình đã cài đặt:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

Sau đó, người dùng thường không nên gọi Truth Sync trực tiếp. Hãy tiếp tục lập trình qua máy chủ AI của bạn; các chỉ dẫn kho đã cài đặt yêu cầu tác tử chạy các kiểm thử liên quan và thực hiện đánh giá Truth Sync trước khi bàn giao khi mã chức năng thay đổi. Bạn xem xét phần diff mã kết quả cùng với diff tài liệu truth.

Nếu bạn chỉ muốn xác thực bằng CLI và chưa muốn các quy trình AI theo máy chủ, hãy để trống `platforms` và chạy `truthmark init && truthmark check`; bạn có thể thêm nền tảng sau và chạy lại `truthmark init`.

## 💡 Vấn đề: khoảng trống tài liệu AI

Các tác tử lập trình AI cực kỳ giỏi viết mã nhanh. Nhưng tốc độ này tạo ra một kiểu lỗi mới nguy hiểm: **câu chuyện của kho lệch khỏi thực tế.**

* Hành vi bị mất trong lịch sử trò chuyện tạm thời.
* Tài liệu kiến trúc nhanh chóng tụt lại phía sau.
* Quyết định sản phẩm biến mất sau khi bàn giao.
* Người xem xét mã phải xem các diff mã thô mà không hiểu "vì sao".
* Mỗi phiên AI mới buộc phải khám phá lại sự thật của kho từ đầu.

## 🎯 Giải pháp: Truthmark

**Truthmark** cài đặt một lớp quy trình làm việc gốc Git vào kho của bạn. Nó khắc phục phần thường bị hỏng trong phát triển bằng AI: giúp tài liệu luôn khớp với mã.

Thay vì hy vọng con người và tác tử AI nhớ cập nhật tài liệu, Truthmark biến việc ghi tài liệu thành một thói quen có hệ thống, có thể xem xét ngay trong kho của bạn.

### ✨ Vì sao Truthmark khác biệt

Truthmark không chỉ là một công cụ tài liệu khác. Nó được tích hợp sâu vào quy trình AI:

* **🚫 Không bị khóa vào nhà cung cấp:** Không dịch vụ lưu trữ, không cơ sở dữ liệu ẩn, không máy chủ bổ sung để vận hành.
* **🌳 100% gốc Git:** Mọi thứ nằm trong kho của bạn. Sự thật di chuyển cùng nhánh của bạn.
* **🤝 Kiến trúc hai bề mặt:** Tách rõ công cụ con người dùng để quản lý kho khỏi quy trình tác tử AI dùng để viết mã.
* **✅ Tin cậy qua xác minh:** Công việc AI dễ được tin tưởng hơn vì công việc thay đổi hành vi bao gồm một quyết định hoặc diff tài liệu sự thật mà con người có thể xem xét.

## 🔄 Cách hoạt động

Khi một tác tử AI sửa mã của bạn, công việc chưa kết thúc. Truthmark cài đặt một chốt quy trình lúc hoàn tất mà tác tử tuân theo trước khi bàn giao:

1. 💻 **Mã:** Tác tử sửa mã chức năng.
2. 🧪 **Kiểm thử:** Các kiểm thử liên quan được chạy.
3. 🔍 **Kiểm tra:** `Truth Sync` kiểm tra tài liệu đã ánh xạ khi quy trình đã cài đặt chạy.
4. 📝 **Ghi tài liệu:** Tài liệu được tác tử cập nhật khi sự thật của kho thay đổi.
5. 👀 **Xem xét:** Con người xem xét *diff mã* + *diff sự thật*.

## 🛠 Hai bề mặt, một hệ thống sự thật

Truthmark được cố ý chia thành hai bề mặt riêng biệt để phục vụ cả người bảo trì và tác tử AI.

### 1. 🧑‍💻 CLI dành cho con người (người bảo trì & CI)

Được nhà phát triển dùng để thiết lập, cấu hình và xác thực kho.
* `truthmark config` - Tạo cấu hình ban đầu của bạn.
* `truthmark init` - Cài đặt định tuyến, khung mẫu và chỉ dẫn cần thiết.
* `truthmark check` - Xác thực các hiện vật sự thật từ terminal.

### 2. 🤖 Quy trình hướng tới AI (tác tử)

Truthmark cài đặt các kỹ năng, prompt và lệnh gốc mà các máy chủ AI được hỗ trợ (như Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity và Cursor) hiểu được. Đây *không phải* lệnh shell; chúng là điểm vào quy trình cho AI.
* `/truthmark-sync` - Quy trình lúc hoàn tất mà tác tử tuân theo sau các thay đổi mã chức năng; không phải lệnh khởi đầu thông thường cho người dùng.
* `/truthmark-document` - Tạo tài liệu cho mã hiện có chưa được ghi tài liệu.
* `/truthmark-structure` - Tổ chức các khu vực kho rộng thành các miền cụ thể.
* `/truthmark-realize` - **Phát triển theo tài liệu trước:** Đọc tài liệu kiến trúc và tạo mã cho khớp.
* `/truthmark-check` - Kiểm toán truth của kho do tác tử điều khiển.

## Bạn nhận được gì

| Khả năng | Tác dụng |
| --- | --- |
| Sự thật gốc Git | Giữ sự thật của kho trong Markdown và cấu hình đã commit. |
| Tài liệu theo phạm vi nhánh | Sự thật di chuyển cùng nhánh thay vì sống trong một phiên riêng tư. |
| CLI dành cho con người | Cung cấp cho người bảo trì các lệnh thiết lập, làm mới, xác thực và kiểm tra. |
| Quy trình hướng tới AI | Cung cấp cho tác tử các quy trình gốc theo máy chủ cho đồng bộ, tài liệu, cấu trúc, hiện thực hóa và kiểm toán. |
| Định tuyến rõ ràng | Ánh xạ các vùng mã tới tài liệu sự thật chuẩn. |
| Bàn giao có thể xem xét | Tạo các diff Git thông thường cho cả mã và tài liệu sự thật. |
| Vận hành ưu tiên cục bộ | Không yêu cầu dịch vụ lưu trữ, daemon, cơ sở dữ liệu hoặc máy chủ MCP. |
| Ranh giới ghi an toàn hơn | Tách các quy trình code-first, doc-first, chỉ đọc và chỉ tài liệu. |
| Xác thực | Báo cáo vấn đề về định tuyến, thẩm quyền, frontmatter, liên kết, bề mặt sinh ra, phạm vi nhánh, độ mới và độ phủ. |
| Portal tùy chọn | Tạo một trang trình bày HTML tĩnh đã commit từ tài liệu sự thật Markdown khi được bật và yêu cầu rõ ràng. |

## Tổng quan trực quan

![Tính năng Truthmark](../assets/truthmark-features.png)

**Tính năng:** Truthmark cài đặt gì và bề mặt quy trình được chia như thế nào.

![Vị trí Truthmark](../assets/truthmark-position.png)

**Vị trí:** Truthmark nằm ở đâu so với prompt, bộ nhớ và quy trình đặc tả.

![Luồng đồng bộ Truthmark](../assets/truthmark-syncflow.png)

**Luồng đồng bộ:** Truth Sync kết thúc các thay đổi mã thông thường trước khi bàn giao như thế nào.

## Vì sao các nhóm áp dụng

Truthmark dành cho các nhóm đã biết tác tử AI có thể tạo mã.

Vấn đề tiếp theo là quản trị.

Không phải quản trị như nghi thức. Quản trị như một câu hỏi đơn giản:

> Sau thay đổi được AI hỗ trợ này, kho có còn nói đúng sự thật không?

Truthmark giúp các nhóm trả lời điều đó bằng các tệp đã commit, định tuyến rõ ràng và diff có thể xem xét.

Nó hữu ích khi bạn cần:

- ít trôi lệch tài liệu hơn
- bàn giao tốt hơn
- sự thật sản phẩm theo từng nhánh
- tài liệu kiến trúc và API bền vững
- quyền sở hữu rõ ràng giữa tài liệu và mã
- ranh giới ghi an toàn hơn cho tác tử
- tài liệu có thể xem xét thay vì bộ nhớ ẩn
- quy trình AI vẫn hoạt động từ các tệp kho đã commit

## Truthmark phù hợp ở đâu

Truthmark không thay thế prompt, bộ nhớ, đặc tả, kiểm thử hoặc xem xét mã.

Nó cho các quy trình đó một nơi bền vững để hạ cánh trong Git.

| Nhu cầu | Phù hợp hơn |
| --- | --- |
| Đầu ra tốt hơn từ một phiên tác tử | Prompt tốt hơn |
| Tính liên tục cá nhân hoặc cấp phiên | Công cụ bộ nhớ |
| Làm tính năng theo kế hoạch trước | Quy trình đặc tả |
| Truth theo nhánh đi cùng mã | Truthmark |
| Xác thực tính đúng của hành vi | Kiểm thử và xem xét |
| Xem xét thay đổi tài liệu do AI hỗ trợ | Truthmark cộng với xem xét Git |

Làn đường của Truthmark được thiết kế có chủ ý là hẹp:

```text
make repository truth explicit
route it to code
install agent workflows around it
keep the result reviewable in Git
```

## Tìm hiểu sâu hơn

README là mặt tiền: ngữ cảnh nhanh, bắt đầu nhanh và mô hình tư duy cốt lõi.

Để biết cách sử dụng từng lệnh, so sánh bề mặt, chi tiết nền tảng được hỗ trợ, cấu hình, định tuyến, Portal và ví dụ, hãy đọc [Hướng dẫn người dùng Truthmark](../user-guide.md).

## Trạng thái dự án

Bản phát hành hiện tại cung cấp:

- các lệnh CLI cục bộ cho config, init, check, index, impact và trạng thái quy trình
- các bề mặt quy trình AI được tạo cho Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity và Cursor
- chẩn đoán về định tuyến, thẩm quyền, frontmatter, liên kết, độ mới, bề mặt sinh ra, phạm vi nhánh và độ phủ
- tài liệu sự thật theo phạm vi nhánh và các hiện vật trí tuệ kho được suy dẫn

## Tài liệu

- [Hướng dẫn người dùng](../user-guide.md)
- [Chỉ mục tài liệu](../README.md)
- [Tổng quan kiến trúc](../truthmark/engineering/architecture/overview.md)
- [Hợp đồng API và CLI](../truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Hướng dẫn bảo trì sự thật của kho](../standards/maintaining-repository-truth.md)

Để xem các lệnh phát triển cục bộ và đóng góp, hãy xem [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Ranh giới thiết kế

Truthmark được cố ý giữ nhỏ: cục bộ, được commit, theo phạm vi nhánh và có thể xem xét.

Nó không phải dịch vụ lưu trữ, máy chủ MCP, cơ sở dữ liệu vector, lớp bộ nhớ ẩn, sản phẩm cưỡng chế CI hay động cơ tự động viết lại mã. Nó giúp sự thật của kho luôn hiển thị; nó không thay thế kiểm thử, xem xét mã hay phán đoán của con người.

## Giấy phép

MIT. Xem [LICENSE](../../LICENSE).
