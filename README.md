📦 Stok & Fatura Yönetim Sistemi

Modern Malzeme Yönetimi, Fatura Takibi, Tahsilat ve Ödeme Kayıtları İçin Tam Entegre Çözüm

🧭 Projenin Amacı

Bu projeye başlama motivasyonum, kendi iş yerimizde aktif olarak kullandığımız malzeme tedarik ve faturalama süreçlerini dijitalleştirme ihtiyacından doğdu.

Bu proje ile amacım:

✔ Fatura girişlerini kolaylaştırmak
✔ Tahsilat & ödeme kayıtlarını tek noktadan yönetmek
✔ Müşteri ve malzeme hareketlerini şeffaf şekilde raporlayabilmek
✔ Son alış ve satış fiyatlarını hızlıca görebilmek
✔ Kullanıcı dostu bir arayüz ile süreçleri hızlandırmak

🏗 Kullanılan Teknolojiler
Backend

Java 17
Spring Boot
Spring Data JPA (Hibernate)
Lombok
MySQL
RESTful API mimarisi


Frontend

React.js
TailwindCSS

🔧 Öne Çıkan Özellikler
🧾 Fatura Yönetimi

Satın alma faturası ekleme / düzenleme / silme

Satış faturası ekleme / düzenleme / silme

Müşteri bakiyesi ile entegre çalışan faturalama sistemi

💰 Tahsilat & Ödeme Takibi

Müşteriden alınan tahsilat kayıtları

Firmaya yapılan ödeme kayıtları

Müşteri bakiyesi ile otomatik ilişki

📦 Malzeme Yönetimi

Malzeme ekleme / düzenleme / silme

Malzemeye ait tüm fiyat geçmişi (alış / satış)

Son satın alma fiyatları listesi

Son satış fiyatları listesi

Faturaya malzeme eklerken sağ tık ile geçmiş fiyat görüntüleme

👥 Müşteri Yönetimi

Müşteri oluşturma, güncelleme, listeleme

Müşteriye özel bakiye takibi

Müşteriye bağlı fatura ve tahsilat geçmişleri

📊 Otomasyon & İş Kuralları

Fatura eklendiğinde müşteri bakiyesinin otomatik güncellenmesi

Fatura silindiğinde bakiyenin geri alınması

MaterialPriceHistory ile fiyatların otomatik arşivlenmesi

🗂 Veritabanı Yapısı

Projede aşağıdaki temel tablolar bulunmaktadır:

customer

material

purchase_invoice

sales_invoice

purchase_invoice_item

sales_invoice_item

received_collection (Alınan Tahsilat)

payment_company (Firmaya Ödeme)

material_price_history (Malzeme fiyat geçmişi)

🖥 Arayüz Özellikleri
✔ Modern ve kullanıcı dostu arayüz

TailwindCSS ile temiz, sade ve hızlı bir arayüz.

✔ Modaller ile düzenleme ekranları

Fatura düzenleme, silme onayı vb. işlemler modern popup’larda yapılır.

✔ Gerçek zamanlı hesaplama

Kalem eklerken toplam tutar anlık güncellenir.

✔ Arama ve filtreleme

Fatura no, müşteri adı veya tarihe göre arama yapılabilir.

🚀 Kurulum
Backend
cd backend
mvn clean install
mvn spring-boot:run

Frontend
cd frontend
npm install
npm run dev
