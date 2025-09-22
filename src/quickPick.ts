import { QuickPickItem, ThemeIcon, Uri, window } from "vscode";

export type QuickPickProps<T extends QuickPickItem | string> = { items: T[], title?: string, clickItemToEdit?: boolean };

export type PickedItems<T extends QuickPickItem> = readonly (T & { editClicked?: boolean })[];//{ selected: T[], editClicked?: boolean };

export function createQuickPick(props: QuickPickProps<any>): Promise<PickedItems<QuickPickItem> | undefined>;

export function createQuickPick<T extends QuickPickItem>(props: QuickPickProps<T>): Promise<PickedItems<T> | undefined> {
    return new Promise((resolve, reject) => {
        let items = props.items;
        if (items.length > 0 && typeof items[0] === 'string') {
            items = items.map(x => ({
                label: x,
                buttons: props.clickItemToEdit ? [{ iconPath: new ThemeIcon('pencil') }] : undefined,
            }) as unknown as T);
        }
        const quickPick = window.createQuickPick<T>();
        quickPick.title = props.title;
        quickPick.items = items;
        quickPick.ignoreFocusOut = true;
        let resolveOnAction = false;
        // Select with single key stroke

        // const changeSelectionListenerDisposable = quickPick.onDidChangeSelection(async (e) => {
        //     console.log(`onDidChangeSelection`, e);
        //     resolveOnAction = true;
        //     quickPick.hide();
        //     try {
        //         if (e.length > 0) {
        //             quickPick.value = e[0].label;
        //             // await chosenItems.action();
        //             resolve(e);
        //         }
        //     } catch (error) {
        //         reject(error);
        //     }
        // });

        const triggerItemButtonListenerDisposable = quickPick.onDidTriggerItemButton(async (e) => {
            // console.log(`onDidTriggerItemButton`, e);
            const item = e.item;
            if (item) {
                (item as any).editClicked = true;
                quickPick.hide();
                resolve([item]);
            }
        });

        const changeActiveListenerDisposable = quickPick.onDidChangeActive(async (e) => {
            // console.log(`onDidChangeActive`, e);
            // quickPick.placeholder = e[0].label;
        });

        // Select with arrows + enter
        const acceptListenerDisposable = quickPick.onDidAccept(async () => {
            // console.log(`onDidAccept`);
            if (quickPick.selectedItems.length > 0) {
                resolveOnAction = true;
                quickPick.hide();
                try {
                    // await chosenItems.action();
                    resolve(quickPick.selectedItems);
                } catch (error) {
                    reject(error);
                }
            }
        });

        const didHideDisposable = quickPick.onDidHide(() => {
            // console.log(`onDidHide`);
            quickPick.dispose();
            triggerItemButtonListenerDisposable.dispose();
            // changeSelectionListenerDisposable.dispose();
            changeActiveListenerDisposable.dispose();
            acceptListenerDisposable.dispose();
            didHideDisposable.dispose();
            if (!resolveOnAction) {
                resolve(undefined);
            }
        });

        quickPick.show();
    });
}
