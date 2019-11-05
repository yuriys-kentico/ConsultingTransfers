namespace Transfers.Models
{
    public class CreateTransferParameters
    {
        public string Region { get; set; }

        public string Name { get; set; }

        public string Customer { get; set; }

        public string Requester { get; set; }

        public string TemplateItemCodename { get; set; }

        public string Localization { get; set; }

        public void Deconstruct(out string region, out string name, out string customer, out string requester, out string templateItemCodename, out string localization)
        {
            region = Region;
            name = Name;
            customer = Customer;
            requester = Requester;
            templateItemCodename = TemplateItemCodename;
            localization = Localization;
        }
    }
}