// export {default} from './myro'
// this doesn't work as expected
// see https://github.com/webpack/webpack/issues/706
// therefore doing it the old school way

import myro from './myro'
module.exports = myro
