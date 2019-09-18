namespace Functions
{
    public interface IEncryptionService
    {
        string Encrypt(string source);

        string Decrypt(string token);
    }
}