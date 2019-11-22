using AzureStorage;

using Core;

using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

using System;
using System.Threading.Tasks;

using Transfers;
using Transfers.Models;

namespace Functions.Queue
{
    public class ProcessContainers : AbstractFunction
    {
        private readonly IStorageRepository storageRepository;
        private readonly ITransfersService transfersService;
        private readonly ICoreContext coreContext;

        public ProcessContainers(
            IStorageRepository storageRepository,
            ITransfersService transfersService,
            ICoreContext coreContext
            )
        {
            this.storageRepository = storageRepository;
            this.transfersService = transfersService;
            this.coreContext = coreContext;
        }

        [FunctionName(nameof(ProcessContainers))]
        public async Task Run(
            [TimerTrigger(
                "0 0 */6 * * *",
                UseMonitor = false
            )]TimerInfo myTimer,
            ILogger log
            )
        {
            try
            {
                foreach (var region in coreContext.Regions)
                {
                    coreContext.Region = region;

                    var containers = await storageRepository.ListContainers();

                    foreach (var container in containers)
                    {
                        if (DateTime.UtcNow >= container.DeleteWhen)
                        {
                            await transfersService.SuspendTransfer(new GetTransferParameters
                            {
                                TransferToken = container.TransferToken
                            });

                            await container.Delete();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogException(log, ex);
            }
        }
    }
}