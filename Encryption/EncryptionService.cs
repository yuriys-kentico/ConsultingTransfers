using Core;

using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Encryption
{
    public class EncryptionService : IEncryptionService
    {
        private readonly string secret = "";

        // The key size of the encryption algorithm in bytes.
        private const int KeySizeBytes = 16;

        // The number of iterations for the password bytes generation function.
        private const int DerivationIterations = 1000;

        public EncryptionService()
        {
            secret = CoreHelper.GetSetting("TokenSecret") ?? secret;
        }

        public string Encrypt(string? source)
        {
            source = source ?? throw new ArgumentNullException(nameof(source));

            static byte[] Get128RandomBits()
            {
                var randomBytes = new byte[KeySizeBytes];

                using (var RNG = RandomNumberGenerator.Create())
                {
                    RNG.GetBytes(randomBytes);
                }

                return randomBytes;
            }

            // Salt and IV are randomly generated each time, but are preprended to encrypted bytes.
            var saltStringBytes = Get128RandomBits();
            var iVStringBytes = Get128RandomBits();
            var sourceBytes = Encoding.UTF8.GetBytes(source);

            using var symmetricKey = new RijndaelManaged();
            using var password = new Rfc2898DeriveBytes(secret, saltStringBytes, DerivationIterations);

            symmetricKey.BlockSize = KeySizeBytes * 8;

            var keyBytes = password.GetBytes(KeySizeBytes);

            using var encryptor = symmetricKey.CreateEncryptor(keyBytes, iVStringBytes);
            using var memoryStream = new MemoryStream();
            using var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write);

            cryptoStream.Write(sourceBytes, 0, sourceBytes.Length);
            cryptoStream.FlushFinalBlock();

            // Concatenate the random salt bytes, the random IV bytes and the encrypted bytes.
            var encryptedBytes = saltStringBytes
                .Concat(iVStringBytes)
                .Concat(memoryStream.ToArray())
                .ToArray();

            return Convert.ToBase64String(encryptedBytes);
        }

        public string Decrypt(string encrypted)
        {
            // [32 bytes of salt] + [32 bytes of IV] + [n bytes of encrypted].
            var saltStringiVStringEncryptedBytes = Convert.FromBase64String(encrypted);

            // Get the salt bytes by extracting the first 32 bytes from encrypted.
            var saltStringBytes = saltStringiVStringEncryptedBytes
                .Take(KeySizeBytes)
                .ToArray();

            // Get the IV bytes by extracting the next 32 bytes from encrypted.
            var ivStringBytes = saltStringiVStringEncryptedBytes
                .Skip(KeySizeBytes)
                .Take(KeySizeBytes)
                .ToArray();

            var encryptedBytes = saltStringiVStringEncryptedBytes
                .Skip(KeySizeBytes * 2)
                .ToArray();

            using var symmetricKey = new RijndaelManaged();
            using var password = new Rfc2898DeriveBytes(secret, saltStringBytes, DerivationIterations);

            symmetricKey.BlockSize = KeySizeBytes * 8;

            var keyBytes = password.GetBytes(KeySizeBytes);

            using var decryptor = symmetricKey.CreateDecryptor(keyBytes, ivStringBytes);
            using var memoryStream = new MemoryStream(encryptedBytes);
            using var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read);

            var plainTextBytes = new byte[encryptedBytes.Length];
            var decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);

            return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
        }
    }
}