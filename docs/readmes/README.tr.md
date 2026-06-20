# Truthmark

**Ajanlarınız kod yazar. Truthmark, insanlara yönelik ve Git üzerinden incelenebilir belgeleri korur.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

![Truthmark afişi](../assets/truthmark-banner.png)

## 🚀 Hızlı Başlangıç: beş dakikada yerelde çalıştırma

Bunu Truthmark tarafından yönetilmesini istediğiniz Git deposunun içinde çalıştırın:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

Gerçekten kullandığınız AI ana makinesini etkinleştirin. Yeni yapılandırmalar ana makineden bağımsızdır; bu yüzden başlatmadan önce `.truthmark/config.yml` dosyasına üst düzey bir `platforms` listesi ekleyin:

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

Ardından depoya yerel gerçeklik belgelerini, yönlendirmeyi ve ajan iş akışı yüzeylerini kurun:

```bash
truthmark init
truthmark check
git diff
```

Şimdi en yaygın benimseme yolunu deneyin: kod ve testlerden mevcut bir davranışı belgeleyin. AI kodlama ana makinenizde, kurulu iş akışına şunu isteyin:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

Bundan sonra kullanıcılar normalde Truth Sync'i doğrudan çağırmamalıdır. AI ana makineniz üzerinden kod yazmaya devam edin; kurulu depo yönergeleri, işlevsel kod değiştiğinde teslimden önce ajana ilgili testleri çalıştırmasını ve Truth Sync incelemesini yapmasını söyler. Siz ortaya çıkan kod farkını ve truth-belge farkını incelersiniz.

Yalnızca CLI doğrulaması istiyor ve henüz ana makineye özgü AI iş akışları istemiyorsanız, `platforms` alanını dışarıda bırakıp `truthmark init && truthmark check` çalıştırın; daha sonra bir platform ekleyip `truthmark init` komutunu yeniden çalıştırabilirsiniz.

## 💡 Sorun: AI dokümantasyon boşluğu

AI kodlama ajanları hızlı kod yazma konusunda olağanüstüdür. Ancak bu hız tehlikeli yeni bir hata biçimi yaratır: **deponun anlattığı hikâye gerçeklikten uzaklaşır.**

* Davranış, geçici sohbet geçmişlerinde kaybolur.
* Mimari belgeleri hızla geride kalır.
* Ürün kararları teslimden sonra kaybolur.
* Kod inceleyenler, "neden"i anlamadan ham kod farklarını incelemek zorunda kalır.
* Her yeni AI oturumu, deponuzun gerçeğini sıfırdan yeniden keşfetmeye zorlanır.

## 🎯 Çözüm: Truthmark

**Truthmark**, deponuza Git'e özgü bir iş akışı katmanı kurar. AI geliştirmesinde genellikle bozulan kısmı düzeltir: belgelerin kodla uyumlu kalmasına yardımcı olmak.

İnsanların ve AI ajanlarının belgeleri güncellemeyi hatırlamasını ummak yerine, Truthmark dokümantasyonu doğrudan deponuzun içinde sistematik ve incelenebilir bir alışkanlığa dönüştürür.

### ✨ Truthmark neden benzersizdir

Truthmark sıradan bir dokümantasyon aracı değildir. AI iş akışına derinlemesine entegredir:

* **🚫 Tedarikçi kilidi yok:** Barındırılan hizmet yok, gizli veritabanı yok, işletilecek ek sunucu yok.
* **🌳 %100 Git'e özgü:** Her şey deponuzda yaşar. Gerçek, dalınızla birlikte hareket eder.
* **🤝 İnsanların sahip olduğu, ajanların izlediği sözleşme:** Bakımcılar depo sözleşmesine sahiptir; ajanlar kod yazarken kurulu talimatları izler.
* **✅ Doğrulama yoluyla güven:** Davranışı değiştiren işlerde insan tarafından incelenebilir bir gerçeklik belgesi kararı veya farkı bulunduğu için AI çalışmasına güvenmek kolaylaşır.

## 🔄 Nasıl çalışır

Bir AI ajanı kodunuzu değiştirdiğinde iş bitmiş sayılmaz. Truthmark, ajanların teslimden önce izlediği bir bitiş zamanı iş akışı koruması kurar:

1. 💻 **Kod:** Ajan işlevsel kodu değiştirir.
2. 🧪 **Test:** İlgili testler çalıştırılır.
3. 🔍 **Kontrol:** Truthmark, kurulu bitiş incelemesinin parçası olarak eşlenen dokümantasyonu kontrol eder.
4. 📝 **Belgeleme:** Depo gerçeği değiştiğinde belgeler ajan tarafından güncellenir.
5. 👀 **İnceleme:** Bir insan *kod farkını* + *gerçeklik farkını* inceler.

## 🛠 Truthmark ile nasıl etkileşirsiniz

Truthmark’ın depo yerelinde tek bir sözleşmesi ve onu kullanmanın iki yolu vardır.

### İnsanlar sözleşmeyi kurar ve doğrular

Bakımcılar ve CI, CLI kullanır:

* `truthmark config` - ilk yapılandırmayı oluşturur.
* `truthmark init` - yönlendirmeyi, truth-doc iskelelerini ve AI ana makine talimatlarını kurar veya yeniler.
* `truthmark check` - depo gerçeğini terminalden doğrular.

### Ajanlar kod yazarken sözleşmeyi izler

Truthmark, Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity ve Cursor gibi desteklenen AI kodlama ana makineleri için depo yerelinde talimatlar kurar.

Normal döngü basittir:

1. Ajanınızdan kod değişikliği isteyin veya mevcut bir davranışı belgelemesini isteyin.
2. Kurulu talimatlar ajana ne zaman test edeceğini, ne zaman truth dokümanlarını güncelleyeceğini ve ne zaman insan incelemesi için duracağını söyler.
3. Siz sıradan Git diff’lerini incelersiniz: kod ve varsa truth-doc değişiklikleri.

Kullanıcı tarafından başlatılan ajan istekleri bilinçli olarak azdır:

* `/truthmark-document` - kod ve testlerden mevcut uygulanmış davranışı belgeler.
* `/truthmark-realize` - mevcut truth dokümanlarından kod uygular.
* `/truthmark-check` - depo gerçeğini denetler.

Truth Sync işe başlamanın olağan yolu değildir; işlevsel kod değişikliklerinden sonraki bitiş incelemesidir.
Truth Structure günlük bir komut değildir; yalnızca çalışmayı engellediğinde yönlendirmeyi veya sahipliği onarır.

## Neler elde edersiniz

| Yetenek | Ne yapar |
| --- | --- |
| Git'e özgü gerçeklik | Depo gerçeğini commit edilmiş Markdown ve yapılandırmada tutar. |
| Dal kapsamlı dokümantasyon | Gerçek, özel bir oturumda yaşamak yerine dalla birlikte hareket eder. |
| İnsan CLI'si | Bakımcılara kurulum, yenileme, doğrulama ve inceleme komutları sağlar. |
| Kurulu ajan rehberliği | Kodlama ajanlarına ne zaman belge yazacağını, test edeceğini, gerçeği senkronize edeceğini, denetleyeceğini veya inceleme için duracağını söyler. |
| Açık yönlendirme | Kod alanlarını kanonik gerçeklik belgelerine eşler. |
| İncelenebilir teslimler | Hem kod hem de gerçeklik belgeleri için sıradan Git farkları üretir. |
| Yerel-öncelikli çalışma | Barındırılan hizmet, daemon, veritabanı veya MCP sunucusu gerektirmez. |
| Daha güvenli yazma sınırları | Kod-öncelikli, belge-öncelikli, salt-okunur ve yalnızca-belge iş akışlarını ayırır. |
| Doğrulama | Yönlendirme, yetki, frontmatter, bağlantı, üretilmiş yüzey, dal kapsamı, güncellik ve kapsam sorunlarını raporlar. |
| İsteğe bağlı Portal | Açıkça etkinleştirilip istendiğinde Markdown gerçeklik belgelerinden commit edilmiş statik bir HTML sunum sitesi üretir. |

## Görsel genel bakış

![Truthmark özellikleri](../assets/truthmark-features.png)

**Özellikler:** Truthmark'ın ne kurduğu ve iş akışı yüzeyinin nasıl bölündüğü.

![Truthmark konumu](../assets/truthmark-position.png)

**Konum:** Truthmark'ın istemlere, belleğe ve spesifikasyon iş akışlarına göre nerede yer aldığı.

![Truthmark senkronizasyon akışı](../assets/truthmark-syncflow.png)

**Senkronizasyon akışı:** Truth Sync'in normal kod değişikliklerini teslimden önce nasıl kapattığı.

## Ekipler neden benimser

Truthmark, AI ajanlarının kod üretebildiğini zaten bilen ekipler içindir.

Sıradaki sorun yönetişimdir.

Tören anlamında yönetişim değil. Basit bir soru olarak yönetişim:

> Bu AI destekli değişiklikten sonra depo hâlâ gerçeği söylüyor mu?

Truthmark, commit edilmiş dosyalar, açık yönlendirme ve incelenebilir farklarla ekiplerin buna yanıt vermesine yardımcı olur.

Şunlara ihtiyaç duyduğunuzda yararlıdır:

- daha az dokümantasyon kayması
- daha iyi teslimler
- dala özgü ürün gerçeği
- kalıcı mimari ve API dokümantasyonu
- belgeler ile kod arasında açık sahiplik
- daha güvenli ajan yazma sınırları
- gizli bellek yerine incelenebilir dokümantasyon
- commit edilmiş depo dosyalarından çalışmaya devam eden AI iş akışları

## Truthmark nerede yer alır

Truthmark istemlerin, belleğin, spesifikasyonların, testlerin veya kod incelemesinin yerini almaz.

Bu iş akışlarına Git içinde kalıcı bir iniş alanı sağlar.

| İhtiyaç | Daha uygun seçenek |
| --- | --- |
| Tek bir ajan oturumundan daha iyi çıktı | Daha iyi istem |
| Kişisel veya oturum düzeyinde süreklilik | Bellek aracı |
| Plan-öncelikli özellik çalışması | Spesifikasyon iş akışı |
| Kodla birlikte taşınan dal kapsamlı gerçek | Truthmark |
| Davranış doğruluğunu doğrulama | Testler ve inceleme |
| AI destekli dokümantasyon değişikliklerini inceleme | Truthmark artı Git incelemesi |

Truthmark'ın alanı tasarım gereği dardır:

```text
make repository truth explicit
route it to code
etrafına ajan rehberliği kurmak
keep the result reviewable in Git
```

## Daha derine inin

README vitrin görevi görür: hızlı bağlam, hızlı başlangıç ve temel zihinsel model.

Komut komut kullanım, yüzey karşılaştırmaları, desteklenen platform ayrıntıları, yapılandırma, yönlendirme, Portal ve örnekler için [Truthmark Kullanıcı Kılavuzu](../user-guide.md) sayfasını okuyun.

## Proje durumu

Mevcut sürüm şunları sağlar:

- config, init, check, index, impact ve iş akışı durumu için yerel CLI komutları
- Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity ve Cursor için oluşturulan depo yerelinde ajan talimatları
- yönlendirme, yetki, frontmatter, bağlantı, güncellik, üretilmiş yüzey, dal kapsamı ve kapsam tanıları
- dal kapsamlı gerçeklik belgeleri ve türetilmiş depo zekâsı artefaktları

## Dokümantasyon

- [Kullanıcı kılavuzu](../user-guide.md)
- [Dokümanlar dizini](../README.md)
- [Mimari genel bakışı](../truthmark/engineering/architecture/overview.md)
- [API ve CLI sözleşmeleri](../truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Depo gerçeği bakım kılavuzu](../standards/maintaining-repository-truth.md)

Yerel geliştirme ve katkı komutları için [CONTRIBUTING.md](../../CONTRIBUTING.md) dosyasına bakın.

## Tasarım sınırları

Truthmark bilinçli olarak küçüktür: yerel, commit edilmiş, dal kapsamlı ve incelenebilir.

Barındırılan bir hizmet, MCP sunucusu, vektör veritabanı, gizli bellek katmanı, CI yaptırım ürünü veya otonom kod yeniden yazma motoru değildir. Depo gerçeğinin görünür kalmasına yardımcı olur; testlerin, kod incelemesinin veya insan yargısının yerini almaz.

## Lisans

MIT. Bkz. [LICENSE](../../LICENSE).
