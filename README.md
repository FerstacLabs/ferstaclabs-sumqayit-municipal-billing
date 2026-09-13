# Sumqayıt Şəhər Mənzil-Kommunal Ödəniş Sistemi

Sumqayıt üçün Azərbaycan dilində hazırlanmış JEK/MKTİB xidmətləri, vətəndaş ödənişləri və inzibatçı paneli demosu. Next.js, React, TypeScript və Tailwind CSS üzərində qurulub; məlumatlar yerli JSON faylında saxlanılır.

İnterfeysdə FerstacLabs və 1Muhasib üçün sadə mətn əsaslı brend nişanları istifadə olunur. Rənglər, səhifələr və mobil menyular vahid bələdiyyə üslubunu qoruyur.

Bu layihə təqdimat prototipidir. Ödənişlər, SMS OTP, SİMA və ASAN yoxlamaları simulyasiyadır. İnzibatçı rolları və təhlükəsizlik nişanları konsepti nümayiş etdirir; server səviyyəsində autentifikasiya, RBAC, VPN və MFA tətbiq olunmayıb. İctimai internetdə istifadədən əvvəl bu nəzarətlər əlavə edilməlidir. Docker portu buna görə standart olaraq yalnız `127.0.0.1` ünvanına bağlanır.

## Lokal işə salmaq

Node.js 22 LTS və npm istifadə edin.

Linux/macOS:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Windows PowerShell:

```powershell
npm ci
Copy-Item -LiteralPath .env.example -Destination .env.local
npm run dev
```

Brauzerdə [http://localhost:3000](http://localhost:3000) ünvanını açın. İnzibatçı paneli: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard).

Yoxlamalar və istehsal rejimində lokal işə salma:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

Server işləyərkən ayrıca terminalda bütün 24 səhifəni, yönləndirmələri, 404 cavablarını və maskalanmış QR API cavabını yoxlamaq olar:

```bash
node scripts/smoke.mjs http://127.0.0.1:3000
```

Bu yoxlama yalnız məlumat oxuyur; mövcud demo əməliyyatlarını dəyişmir.

GitHub Actions hər push və pull request üçün `npm ci`, lint, TypeScript, test və production build yoxlamalarını icra edir.

## Demo ssenarisi

1. Borc sorğusunda `527418936204` kodunu daxil edin.
2. Nümunə mənzil: Sumqayıt şəhəri, 12-ci mikrorayon, bina 48, mənzil 125; 4 sakin, 72,5 m². Zibil haqqı 2,80 ₼, mənzil haqqı 10,88 ₼, aylıq cəm 13,68 ₼, ilkin ümumi borc 41,04 ₼.
3. Simulyasiya ödənişini təsdiqləyin; yenilənmiş balansı, qəbzi və əməliyyat nömrəsini göstərin.
4. Arayış sorğusunda SMS üsulunu və demo OTP kodu `123456` istifadə edin. SİMA və ASAN üsulları da simulyasiya kimi işləyir.
5. Arayışın QR yoxlama səhifəsində sənədin statusunu və maskalanmış əmlak kodunu göstərin.
6. İnzibatçı panelində eyni tranzaksiya üçün təkrar callback sınağı aparın; balans ikinci dəfə dəyişməməlidir.
7. Sakin məlumatını yeniləyib əvvəlki hesab-fakturanın saxlanmış sakin/sahə göstəricilərinin dəyişmədiyini göstərin. Hesabatı CSV formatında yükləyin.

Ətraflı təqdimat ardıcıllığı: [docs/DEMO.md](docs/DEMO.md).

Əmlakın açıq ödəniş kodu sahibə deyil, əmlaka bağlıdır və satış zamanı dəyişmir. Daxili strukturlaşdırılmış kod nümunəsi: `SMQ-R-Z03-B0487-E02-F0125`.

## Səhifələr

| Ünvan | Məzmun |
| --- | --- |
| `/` | Xidmətlər, sürətli keçidlər, göstəricilər və istifadə qaydası |
| `/services` | Kommunal xidmətlər və müraciət keçidləri |
| `/tariffs` | Yaşayış tarifləri və kommersiya tarifinin təsdiqi |
| `/payment` | Borc sorğusu, simulyasiya ödənişi və qəbz |
| `/certificate` | SMS, SİMA və ASAN simulyasiyası ilə arayış |
| `/verify` | QR/sənəd doğrulaması; məhdud və maskalanmış məlumat |
| `/news` | Nümunə elanlar |
| `/contact` | Əlaqə məlumatları və dəstək forması |
| `/admin/dashboard` | KPI, diaqramlar və son əməliyyatlar |
| `/admin/buildings` | Binalar, filtrlər və bina redaktəsi |
| `/admin/properties` | Əmlak axtarışı, balans və tarixçə |
| `/admin/residents` | Sakin göstəriciləri və hesablanma tarixində saxlanmış surətlər |
| `/admin/commercial-objects` | Qeyri-yaşayış obyektləri və tarif təsdiqi |
| `/admin/tariffs` | Tariflər, qüvvəyə minmə tarixi və təsdiq vəziyyəti |
| `/admin/billing` | Dövrlər, aylıq hesablanma və hesab-faktura sətirləri |
| `/admin/invoices` | Hesab-faktura reyestri, status filtrləri və sənəd detalları |
| `/admin/payments` | Ödəniş reyestri, callback və təkrar tranzaksiya sınağı |
| `/admin/reconciliation` | Hesabat idxalı simulyasiyası və tutuşdurma |
| `/admin/certificates` | Arayış sorğuları və yoxlama keçidləri |
| `/admin/users-roles` | Altı rol, icazə matrisi və MFA konsepti |
| `/admin/audit-log` | İstifadəçi, modul və tarix filtrləri olan audit jurnalı |
| `/admin/reports` | Dövr və ərazi üzrə statistika, maliyyə göstəriciləri və CSV ixracı |
| `/admin/settings` | Standart hesabat ayı, cədvəl sətir sayı və görünüş sıxlığı |
| `/admin/system-architecture` | Gələcək sistem arxitekturasının təqdimatı |

## Məlumatlar və saxlanma

İlk sorğuda demo avtomatik yaradılır: 10 ərazi, 30 bina, 100 mənzil/əmlak, 15 kommersiya obyekti, 12 istifadəçi, 50 hesab-faktura, 60 ödəniş və 20 audit hadisəsi. Adlar maskalanmış, bütün şəxs və əməliyyat məlumatları sünidir. Ana səhifədəki şəhər göstəriciləri də təqdimat üçün nümunə rəqəmlərdir.

İlkin mənzil balansları saxlanmış hesab-fakturaların ödənilməmiş cəminə uyğundur. İlkin 60 ödəniş provayder tarixçəsinin ayrıca sintetik nümunələridir və seed zamanı balanslara yenidən tətbiq edilmir; bu tarixçə tam mühasibat dövriyyəsi deyil. Demo zamanı yaradılan yeni ödənişlər isə balansı və hesab-fakturaları birlikdə yeniləyir.

Dəyişikliklər standart olaraq `.demo/data.json` faylında qalır. `DEMO_DATA_DIR` server dəyişəni başqa qovluq seçir. Yazılar proses daxilində növbələnir və fayl atomik olaraq əvəzlənir. Bu, bir server prosesi üçün nəzərdə tutulub; birdən çox replika, serverless mühit və istehsal verilənlər bazası kimi istifadə edilməməlidir.

İlkin vəziyyətə qayıtmaq üçün tətbiqi dayandırın, yalnız demo məlumat faylını silin və yenidən başladın:

```bash
rm .demo/data.json
npm run dev
```

```powershell
Remove-Item -LiteralPath .demo/data.json
npm run dev
```

`DEMO_DATA_DIR` dəyişdirilibsə, həmin qovluqdakı `data.json` faylını silin. Sıfırlama bütün demo əməliyyatlarını itirir.

Pul məbləğləri qəpik dəqiqliyi ilə hesablanır. Aylıq hesab-faktura yaradılarkən sakin sayı, sahə və tarif məlumatlarının həmin dövr üçün surəti saxlanılır. Təkrar provayder tranzaksiyası balansdan ikinci dəfə çıxılmır. Bunlar yerli demo davranışlarıdır; real provayder təsdiqi və bank tutuşdurması inteqrasiya edilməyib.

`npm test` pul hesablaması və yuvarlaqlaşdırma, təkrar tranzaksiya, arayışın doğrulanması, hesab-faktura surətinin dəyişməməsi və demo məlumatlarının saxlanması üzrə avtomatlaşdırılmış yoxlamaları işlədir. Hesabatlar mövcud süni reyestrlərdən hesablanır; CSV ixracı brauzerdə fayl yaradır.

İnzibatçı sazlamaları — standart hesabat ayı, səhifədə 8/16/32 sətir və cədvəl sıxlığı — həmin brauzerin `localStorage` yaddaşında saxlanır. Bu seçimlər server reyestrinə və tariflərə təsir etmir. Sazlamalar səhifəsində ilkin seçimlərə qayıtmaq olar; serverin demo məlumat faylını silmək brauzer seçimlərini sıfırlamır.

## Mühit dəyişənləri

| Dəyişən | Standart | Təyinat |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | boş | Boş olduqda yerli `/api`; gələcək backend üçün məsələn `https://api.example.az/api` |
| `DEMO_DATA_DIR` | `.demo` | Serverdə demo JSON faylının saxlandığı qovluq |
| `PORT` | `3000` | Docker Compose-un host portu; konteyner daxilində port 3000 qalır |

`NEXT_PUBLIC_` dəyişənləri brauzerə açıqdır; burada məxfi açar saxlamayın. Next.js bu dəyəri build vaxtı bağlayır, buna görə dəyişdikdə tətbiqi yenidən build edin. Backend alternativi eyni API müqaviləsini dəstəkləməlidir; dəyişəni təyin etmək özü .NET serveri yaratmır.

## Docker / Ubuntu

Docker Engine və Compose plugin quraşdırıldıqdan sonra layihə qovluğunda:

```bash
cp .env.example .env
docker compose up --build -d
docker compose logs -f app
```

PowerShell-də ilk əmri `Copy-Item -LiteralPath .env.example -Destination .env` ilə əvəz edin. Tətbiq [http://localhost:3000](http://localhost:3000) ünvanında açılır. Compose yalnız bir tətbiq konteyneri başladır və demo məlumatlarını `demo-data` adlı volume-da saxlayır. Konteyner imici çoxmərhələli build və Next.js `standalone` çıxışından istifadə edir; tətbiq root olmayan istifadəçi ilə işləyir.

```bash
docker compose down
docker compose up --build -d
```

Bu əmrlər saxlanmış məlumatları qoruyur. Tam demo sıfırlaması üçün `docker compose down --volumes` volume-u da silir; sonra yenidən `docker compose up --build -d` icra edin.

Uzaq Ubuntu serverində şəxsi təqdimat üçün SSH tuneli açmaq olar:

```bash
ssh -L 3000:127.0.0.1:3000 user@server
```

Sonra öz kompüterinizdə `http://localhost:3000` açın. İctimai yerləşdirmə üçün əvvəlcə autentifikasiya və server icazələri tətbiq edin, sonra HTTPS reverse proxy və giriş siyasətini sazlayın. Bu repozitoriya hazır istehsal təhlükəsizlik konfiqurasiyası təqdim etmir.

## Gələcək .NET backend bağlantısı

Əsas kod qovluqları:

```text
src/app/                 Vətəndaş səhifələri, /admin və mock API marşrutları
src/components/          İctimai sayt və inzibatçı interfeys komponentləri
src/lib/types.ts         API və domen məlumat müqavilələri
src/lib/api.ts           Gələcək .NET bağlantısı üçün brauzer adapteri
src/lib/engine.ts        Hesablanma, ödəniş və arayış əməliyyat qaydaları
src/lib/seed.ts          Süni məlumatların ilkin yaradılması
src/lib/store.ts         JSON saxlanması; gələcək DB adapterinin sərhədi
tests/                   Domen və saxlanma davranış yoxlamaları
docs/DEMO.md             Təqdimat ssenarisi
```

Brauzer API adapteri `NEXT_PUBLIC_API_BASE_URL` üzərindən işləyir. Hazır demo müqaviləsi `GET /api/demo` (inzibatçı datası), `POST /api/demo` (demo əməliyyatları) və `GET /api/certificates/{id}` (məxfi məlumatları çıxarmayan sənəd yoxlaması) marşrutlarını istifadə edir. Hazır `GET /api/demo` autentifikasiya tələb etmir və yalnız süni təqdimat məlumatı üçün nəzərdə tutulub.

.NET keçidi üçün əvvəlcə adapter müqaviləsini qorumaq, sonra resursları ayrıca servislərə ayırmaq olar. Aşağıdakılar **təklif olunan istehsal API-ləridir; bu repozitoriyada ayrıca .NET endpoint kimi tətbiq edilməyib**:

| Endpoint | Təyinat |
| --- | --- |
| `GET /api/properties/{paymentCode}/balance` | Məhdudlaşdırılmış borc sorğusu |
| `POST /api/payments/intents` | Provayder ödəniş sessiyası yaratmaq |
| `POST /api/payments/callbacks/{provider}` | İmza təsdiqi və idempotent ledger yazısı |
| `POST /api/certificates/requests` | Real identifikasiya ilə arayış müraciəti |
| `GET /api/certificates/{verificationToken}` | Məhdud açıq doğrulama cavabı |
| `POST /api/billing/periods/{period}/generate` | Dövr üzrə snapshot hesablanması |
| `POST /api/reconciliation/imports` | Provayder hesabatının idxalı |
| `GET /api/audit-events` | Səlahiyyətli, səhifələnmiş audit sorğusu |

İstehsala keçid planı:

- PostgreSQL tranzaksiyaları, pul üçün dəqiq onluq/qəpik modeli, unikal provayder/tranzaksiya indeksi və köçürmələr.
- OIDC/ASAN/SİMA inteqrasiyası, real OTP provayderi, sessiyalar, MFA və serverdə hər əməliyyat üçün RBAC.
- Provayder callback imzası, replay müdafiəsi, uyğunluq yoxlamaları və gündəlik avtomatik tutuşdurma.
- VPN/şəbəkə sərhədi, WAF, TLS, sürət məhdudiyyəti, CSRF müdafiəsi və təhlükəsiz məxfi açar idarəetməsi.
- Dəyişdirilməyə qarşı qorunan audit anbarı, şifrələnmiş backup, bərpa sınaqları və monitorinq.
- Sənəd üçün yüksək entropiyalı yoxlama tokenləri, müddət və ləğv qaydaları; şəxsi məlumatların minimum açıqlanması.
- OWASP ASVS əsasında təhlükəsizlik yoxlaması, məxfilik qaydaları və istismar prosedurları.

Bu maddələr arxitektura səhifəsində təqdim olunan hədəf nəzarətlərdir. Demo nişanları həmin nəzarətlərin hazır tətbiq olunduğu mənasına gəlmir.
