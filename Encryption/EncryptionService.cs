using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Encryption
{
    public class EncryptionService : IEncryptionService
    {
        private readonly string secret;

        // The key size of the encryption algorithm in bytes
        private const int KeySizeBytes = 16;

        // The number of iterations for the password bytes generation function
        private const int DerivationIterations = 1000;

        public EncryptionService(string secret)
        {
            this.secret = secret;
        }

        public string Encrypt(string source)
        {
            byte[] Get128RandomBits()
            {
                var randomBytes = new byte[KeySizeBytes];

                using (var RNG = RandomNumberGenerator.Create())
                {
                    RNG.GetBytes(randomBytes);
                }

                return randomBytes;
            }

            // Salt and IV are randomly generated each time, but are preprended to encrypted cipher text
            var saltStringBytes = Get128RandomBits();
            var iVStringBytes = Get128RandomBits();

            var plainTextBytes = Encoding.UTF8.GetBytes(source);

            using (var password = new Rfc2898DeriveBytes(secret, saltStringBytes, DerivationIterations))
            {
                var keyBytes = password.GetBytes(KeySizeBytes);

                using (var symmetricKey = new RijndaelManaged())
                {
                    symmetricKey.BlockSize = 128;
                    symmetricKey.Mode = CipherMode.CBC;
                    symmetricKey.Padding = PaddingMode.PKCS7;

                    using (var encryptor = symmetricKey.CreateEncryptor(keyBytes, iVStringBytes))
                    {
                        using (var memoryStream = new MemoryStream())
                        {
                            using (var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                            {
                                cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
                                cryptoStream.FlushFinalBlock();

                                // Create the final bytes as a concatenation of the random salt bytes, the random IV bytes and the cipher bytes.
                                var cipherTextBytes = saltStringBytes
                                    .Concat(iVStringBytes)
                                    .Concat(memoryStream.ToArray())
                                    .ToArray();

                                return Convert.ToBase64String(cipherTextBytes);
                            }
                        }
                    }
                }
            }
        }

        public string Decrypt(string token)
        {
            // Get the complete stream of bytes that represent:
            // [32 bytes of Salt] + [32 bytes of IV] + [n bytes of CipherText]
            var cipherTextBytesWithSaltAndIv = Convert.FromBase64String(token);

            // Get the salt bytes by extracting the first 32 bytes from the supplied cipherText bytes.
            var saltStringBytes = cipherTextBytesWithSaltAndIv
                .Take(KeySizeBytes)
                .ToArray();

            // Get the IV bytes by extracting the next 32 bytes from the supplied cipherText bytes.
            var ivStringBytes = cipherTextBytesWithSaltAndIv
                .Skip(KeySizeBytes)
                .Take(KeySizeBytes)
                .ToArray();

            // Get the actual cipher text bytes by removing the first 64 bytes from the cipherText string.
            var cipherTextBytes = cipherTextBytesWithSaltAndIv
                .Skip(KeySizeBytes * 2)
                .ToArray();

            using (var password = new Rfc2898DeriveBytes(secret, saltStringBytes, DerivationIterations))
            {
                var keyBytes = password.GetBytes(KeySizeBytes);

                using (var symmetricKey = new RijndaelManaged())
                {
                    symmetricKey.BlockSize = 128;
                    symmetricKey.Mode = CipherMode.CBC;
                    symmetricKey.Padding = PaddingMode.PKCS7;

                    using (var decryptor = symmetricKey.CreateDecryptor(keyBytes, ivStringBytes))
                    {
                        using (var memoryStream = new MemoryStream(cipherTextBytes))
                        {
                            using (var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                            {
                                var plainTextBytes = new byte[cipherTextBytes.Length];
                                var decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);

                                return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
                            }
                        }
                    }
                }
            }
        }
    }
}