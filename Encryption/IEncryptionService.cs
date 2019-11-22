namespace Encryption
{
    public interface IEncryptionService
    {
        string Encrypt(string? source);

        string Decrypt(string encrypted);
    }
}