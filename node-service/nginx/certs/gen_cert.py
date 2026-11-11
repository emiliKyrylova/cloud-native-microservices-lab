import os
from datetime import datetime, timedelta
from cryptography import x509
from cryptography.x509.name import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

def generate_self_signed_cert():
    certs_dir = "nginx/certs"
    os.makedirs(certs_dir, exist_ok=True)

    # 1. Генеруємо приватний ключ
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    # 2. Формуємо сертифікат
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, u"localhost"),
    ])
    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        private_key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.utcnow()
    ).not_valid_after(
        datetime.utcnow() + timedelta(days=365)
    ).add_extension(
        x509.SubjectAlternativeName([x509.DNSName(u"localhost")]),
        critical=False,
    ).sign(private_key, hashes.SHA256())

    # 3. Зберігаємо приватний ключ у privkey.pem
    with open(os.path.join(certs_dir, "privkey.pem"), "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        ))

    # 4. Зберігаємо сертифікат у fullchain.pem
    with open(os.path.join(certs_dir, "fullchain.pem"), "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))

    print("✅ Самопідписані SSL сертифікати успішно створені в папці nginx/certs!")

if __name__ == "__main__":
    generate_self_signed_cert()