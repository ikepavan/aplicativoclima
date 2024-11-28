#include "MainApplicationModuleProvider.h"

#include <rncore.h>

namespace facebook {
namespace react {

std::shared_ptr<TurboModule> MainApplicationModuleProvider(
    const std::string moduleName,
    const JavaTurboModule::InitParams &params) {

  return rncore_ModuleProvider(moduleName, params);
}

} // namespace react
} // namespace facebook
