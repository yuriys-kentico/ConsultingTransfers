namespace Encryption.Models
{
    public class TransferToken
    {
        public string Region { get; set; }

        public string Codename { get; set; }

        public void Deconstruct(out string region, out string codename)
        {
            region = Region;
            codename = Codename;
        }
    }
}