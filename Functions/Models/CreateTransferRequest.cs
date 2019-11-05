namespace Functions.Models
{
    public class CreateTransferRequest
    {
        public string Name { get; set; }

        public string Customer { get; set; }

        public string Requester { get; set; }

        public string Template { get; set; }

        public string Localization { get; set; }

        public void Deconstruct(out string name, out string customer, out string requester, out string template, out string localization)
        {
            name = Name;
            customer = Customer;
            requester = Requester;
            template = Template;
            localization = Localization;
        }
    }
}