import * as Browser from '../shared/types/browser'
import CustomProcedure from '../shared/types/custom-procedure'
import ExtractTabsByDomain from './extract-tabs-by-domain'
import GroupTabsByDomain from './group-tabs-by-domain'
import MergeWindows from './merge-windows'
import SortTabsByDomain from './sort-tabs-by-domain'
import UngroupTabs from './ungroup-tabs'

export function getCustomProcedures(
  browserService: Browser.Service,
): CustomProcedure[] {
  return [
    new ExtractTabsByDomain(browserService),
    new MergeWindows(browserService),
    new SortTabsByDomain(browserService),
    new GroupTabsByDomain(browserService),
    new UngroupTabs(browserService),
  ]
}
