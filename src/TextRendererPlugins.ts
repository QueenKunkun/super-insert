
import { Plugin } from '@datadocs/rose-formatter';
import { CN_MONTH_NAMES, CN_WEEKDAYS } from './BuiltInSequences';

const ZH_CN = 'zh-CN';

// const defaultPluginKey = 'en-US';

// let currentPluginKey = defaultPluginKey;

const plugins: { [key: string]: Plugin } = {
    [ZH_CN]: {
        getWeekDay(index, options) {
            if (options?.ddd) {
                return `周${CN_WEEKDAYS[index]}`;
            } else if (options?.dddd) {
                return `星期${CN_WEEKDAYS[index]}`;
            }
            return CN_WEEKDAYS[index];
        },

        getMonthName(index, options) {
            if (options?.mmm || options?.mmmm) {
                return `${CN_MONTH_NAMES[index]}月`;
            } else if (options?.mmmmm) {
                return `${CN_MONTH_NAMES[index]}`;
            }
            return "";
        },
    } as Plugin,
}

export function addPlugin(key: string, inteceptor: Plugin) {
    plugins[key] = inteceptor;
}

export function removePlugin(key: string) {
    delete plugins[key];
}

export function getPlugin(key: string | undefined) {
    return key ? plugins[key] : undefined;
}

// export function getCurrentPlugin() {
//     return currentPluginKey;
// }

// export function setCurrentPlugin(key: string | undefined) {
//     currentPluginKey = key ?? defaultPluginKey;
// }

// export function registerTextRenderPlugins() {
//     for (const key in plugins) {
//         if (!Object.hasOwn(plugins, key)) continue;

//         if (!getPlugin(key)) {
//             registerPlugin(key, plugins[key]);
//         }
//     }

//     setCurrentPlugin(ZH_CN);
// }
