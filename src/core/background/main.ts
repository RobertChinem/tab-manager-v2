import { getCustomProcedures } from '../../custom-procedures'
import ChromeMessageHandler from './chrome-message-handler'
import ChromeService from './chrome-service'
import GetProcedures from './internal-procedures/get-procedures'

class App {
  private readonly chromeMessageHandler: ChromeMessageHandler

  constructor(chromeMessageHandler: ChromeMessageHandler) {
    this.chromeMessageHandler = chromeMessageHandler
  }

  start() {
    this.chromeMessageHandler.start()
  }
}

const chromeService = new ChromeService()
const app = new App(
  new ChromeMessageHandler({
    internalProcedures: [new GetProcedures()],
    customProcedures: getCustomProcedures(chromeService),
  }),
)

app.start()
