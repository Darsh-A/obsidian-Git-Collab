import {App, PluginSettingTab, Setting} from 'obsidian';
import gitCollab from 'src/main';

//Settings Tab

export class gitCollabSettingTab extends PluginSettingTab {
    plugin: gitCollab;

    constructor(app: App, plugin: gitCollab) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {

        const { containerEl } = this;

        containerEl.empty();

        const mainSettingsContainer = containerEl.createDiv();
        mainSettingsContainer.createEl('h1', { text: 'Git-Collab' });

        //Personal Settings

        mainSettingsContainer.createEl('h3', { text: 'Personal Settings' });
        mainSettingsContainer.createEl('strong', {text: 'Ensure that .obsidian/plugins/git-collab/ is added to your .gitignore file!', attr: {style: 'color: var(--color-red);'}});

        new Setting(mainSettingsContainer)
                .setName('Enter GitHub Username')
                .setDesc('GitHub username of your account.')
                .addText(text => text
                    .setValue(this.plugin.settings.username)
                    .onChange(async (value) => {
                        this.plugin.settings.username = value;
                        await this.plugin.saveSettings();
                    }
        ));

        new Setting(mainSettingsContainer)
            .setName('Github Personal Access Token')
            .setDesc('Personal Access Token for Github. Find more info here: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token')
            .addText(text => text
                .setValue(this.plugin.settings.token)
                .onChange(async (value) => {
                    this.plugin.settings.token = value;
                    await this.plugin.saveSettings();
        }));

        mainSettingsContainer.createEl("h3", {text: "Repository Settings"});

        new Setting(mainSettingsContainer)
            .setName('GitHub Repository URL')
            .setDesc('URL of the GitHub repository you want to use. Example: https://github.com/Drosophilaa/Obsidian-GitCollab.git')
            .addText(text => text
                .setValue(this.plugin.settings.gitHubUrl)
                .onChange(async (value) => {
                    this.plugin.settings.gitHubUrl = value;
                    await this.plugin.saveSettings();
        }));
        
        new Setting(mainSettingsContainer)
                .setName('Time Interval to check for Activity (in mins)')
                .setDesc(`Fetches commits from past ${this.plugin.settings.checkTime} minutes. Default: 2 minutes`)
                .addText(text => text
                    .setPlaceholder('2')
                    .setValue(`${this.plugin.settings.checkTime}`)
                    .onChange(async (value) => {
                        this.plugin.settings.checkTime = Math.round(parseFloat(value));
                        await this.plugin.saveSettings();
        }));

        new Setting(mainSettingsContainer)
            .setName('Time between each check (in seconds)')
            .setDesc(`Fetches commits every ${this.plugin.settings.checkInterval}. Default: 15 seconds`)
            .addText(text => text
                .setPlaceholder('15')
                .setValue(`${this.plugin.settings.checkInterval}`)
                .onChange(async (value) => {
                    this.plugin.settings.checkInterval = Math.round(parseFloat(value));
                    await this.plugin.saveSettings();
        }));

        //Feature Toggles
        
        mainSettingsContainer.createEl("h3", {text: "Feature Toggles"});

        new Setting(mainSettingsContainer)
            .setName('Ribbon Button')
            .setDesc(`Adds a Button to ribbon to show all commits by every author in past ${this.plugin.settings.ribbonCheckInterval} minutes.`)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.ribbon)
                .onChange(async (value) => {
                    this.plugin.settings.ribbon = value;
                    await this.plugin.saveSettings();
                    this.display();
        }));

        //add status to the status bar
        new Setting(mainSettingsContainer)
            .setName('Status Bar')
            .setDesc('Display Status of active files in the status bar.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.status)
                .onChange(async (value) => {
                    this.plugin.settings.status = value;
                    await this.plugin.saveSettings();
                    this.display();
        }));

        //Notice when someone opens the active file
        new Setting(mainSettingsContainer)
            .setName('Notices!')
            .setDesc('Give Notices if someone else is editing the same file.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.notice)
                .onChange(async (value) => {
                    this.plugin.settings.notice = value;
                    await this.plugin.saveSettings();
                    this.display();
        }));

        mainSettingsContainer.createEl("h3", {text: "Additonal Settings"});

        new Setting(mainSettingsContainer)
            .setName('Additional Formatting')
            .setDesc('Format almost all visible properties.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.allFormatting)
                .onChange(async (value) => {
                    this.plugin.settings.allFormatting = value;
                    await this.plugin.saveSettings();
                    this.display();
                })    
            );
        
        new Setting(mainSettingsContainer)
            .setName('Debug Mode')
            .setDesc('Print useful debugging messages to console.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.debugMode)
                .onChange(async (value) => {
                    this.plugin.settings.debugMode = value;
                    await this.plugin.saveSettings();
                    this.display();
        }));

        new Setting(mainSettingsContainer)
            .setName('Close Obsidian')
            .setDesc('Some options require a restart for obsidian to take effect. Click this button to close Obsidian.')
            .addButton((button) => {
                button.buttonEl.setAttr('style', 'color: var(--color-red);');
                button
                .setButtonText('Close Obsidian')
                .onClick(async () => {
                    window.close();
                });
            });

        if (this.plugin.settings.notice == true && this.plugin.settings.allFormatting == true) {

            const noticeContainer = containerEl.createDiv();
            noticeContainer.createEl('h1', { text: 'Notice Settings' });

            new Setting(noticeContainer)
                .setName('Notice Prompt Text')
                .setDesc('Text in the notice prompt when someone else is editing a file. Special keywords: $author, $fileName')
                .addTextArea(text => text
                    .setValue(this.plugin.settings.noticePrompt)
                    .onChange(async (value) => {
                        this.plugin.settings.noticePrompt = value;
                        await this.plugin.saveSettings();
                    })
            );
        }

        if (this.plugin.settings.status == true && this.plugin.settings.allFormatting == true) {

            const statusContainer = containerEl.createDiv();
            statusContainer.createEl('h1', { text: 'Status Bar Settings' });

            new Setting(statusContainer)
                .setName('Settings not set Status Text')
                .setDesc('The actual label displayed when settings are not set.')
                .addTextArea(text => text
                    .setValue(this.plugin.settings.settingsNotSetStatus)
                    .onChange(async (value) => {
                        this.plugin.settings.settingsNotSetStatus = value;
                        await this.plugin.saveSettings();
                    })
            );
            
            new Setting(statusContainer)
                .setName('Settings not set Status Label')
                .setDesc('The arial label text when settings are not set.')
                .addTextArea(text => text
                    .setValue(this.plugin.settings.settingsNotSetLabel)
                    .onChange(async (value) => {
                        this.plugin.settings.settingsNotSetLabel = value;
                        await this.plugin.saveSettings();
                    })
            );
                    
            new Setting(statusContainer)
                .setName('No Commits Found Status Text')
                .setDesc('The actual label displayed when no commits were found. Restart Obsidian for it to take effect.')
                .addTextArea(text => text
                    .setValue(this.plugin.settings.noCommitsFoundStatus)
                    .onChange(async (value) => {
                        this.plugin.settings.noCommitsFoundStatus = value;
                        await this.plugin.saveSettings();
                    })
            );
            
            new Setting(statusContainer)
                .setName('No Commits Found Status Label')
                .setDesc('The arial label displayed when no commits were found. Restart Obsidian for it to take effect.')
                .addTextArea(text => text
                    .setValue(this.plugin.settings.noCommitsFoundLabel)
                    .onChange(async (value) => {
                        this.plugin.settings.noCommitsFoundLabel = value;
                        await this.plugin.saveSettings();
                    })
            );
            
            new Setting(statusContainer)
                .setName('File Editable Status Text')
                .setDesc('The actual label displayed when a file can be edited.')
                .addTextArea(text => text
                    .setValue(this.plugin.settings.fileEditableStatus)
                    .onChange(async (value) => {
                        this.plugin.settings.fileEditableStatus = value;
                        await this.plugin.saveSettings();
                    })
            );
            
            new Setting(statusContainer)
                .setName('File Not Editable Status Text')
                .setDesc('The actual label displayed when a file is edited by someone else.')
                .addTextArea(text => text
                    .setValue(this.plugin.settings.fileNotEditableStatus)
                    .onChange(async (value) => {
                        this.plugin.settings.fileNotEditableStatus = value;
                        await this.plugin.saveSettings();
                    })
            );

        }

        if (this.plugin.settings.ribbon == true) {

            const ribbonContainer = containerEl.createDiv();
            ribbonContainer.createEl('h1', { text: 'Ribbon Button Settings' });

            new Setting(ribbonContainer)
                .setName('Ribbon Interval')
                .setDesc(`Fetch all commits in previous ${this.plugin.settings.ribbonCheckInterval} minutes. Default is 5 minutes.`)
                .addText(text => text
                    .setValue(this.plugin.settings.ribbonCheckInterval.toString())
                    .onChange(async (value) => {
                        this.plugin.settings.ribbonCheckInterval = parseInt(value);
                        await this.plugin.saveSettings();
                    })
            );

            new Setting(ribbonContainer)
                .setName('Display File Path In Modal')
                .setDesc('Show file path along with name in the modal.')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.ribbonDisplayPath)
                    .onChange(async (value) => {
                        this.plugin.settings.ribbonDisplayPath = value;
                        await this.plugin.saveSettings();
                    })
                );

            if (this.plugin.settings.allFormatting == true) {

                const ribbonFormattingContainer = ribbonContainer.createDiv();
                ribbonFormattingContainer.createEl('h3', { text: 'Ribbon Modal Formatting' });
                ribbonFormattingContainer.createEl('strong', { text: 'Danger! Do not mess with this if you do not know what you are doing!', attr: { style: 'color: var(--text-error); text-decoration: underline; text-decoration-color: var(--text-error);' } });

                new Setting(ribbonFormattingContainer)
                    .setName('Title CSS')
                    .setDesc('CSS for the title of the modal.Default is:\ntext-align: center; font-size: 50px; color: var(--color-green); padding-bottom: 10px;')
                    .addTextArea(text => text
                        .setValue(this.plugin.settings.ribbonModalTitleCSS)
                        .onChange(async (value) => {
                            this.plugin.settings.ribbonModalTitleCSS = value;
                            await this.plugin.saveSettings();
                        }
                    ));
                
                new Setting(ribbonFormattingContainer)
                        .setName('Fetching Commits CSS')
                        .setDesc('CSS for the fetching commits text. Default is:\ntext-align: left; font-size: 20px; color: var(--color-blue);')
                        .addTextArea(text => text
                            .setValue(this.plugin.settings.ribbonModalFetchingCommitsCSS)
                            .onChange(async (value) => {
                                this.plugin.settings.ribbonModalFetchingCommitsCSS = value;
                                await this.plugin.saveSettings();
                            }
                        ));
                
                new Setting(ribbonFormattingContainer)
                        .setName('No Commits CSS')
                        .setDesc('CSS for the no commits text. Default is:\ntext-align: center; font-size: 30px; color: var(--color-red);')
                        .addTextArea(text => text
                            .setValue(this.plugin.settings.ribbonModalNoCommitsCSS)
                            .onChange(async (value) => {
                                this.plugin.settings.ribbonModalNoCommitsCSS = value;
                                await this.plugin.saveSettings();
                            }
                        ));

                new Setting(ribbonFormattingContainer)
                    .setName('No Commits Text')
                    .setDesc('Text to display when no commits are found. Default is:\nNo Commits Found')
                    .addTextArea(text => text
                        .setValue(this.plugin.settings.ribbonModalNoCommitsText)
                        .onChange(async (value) => {
                            this.plugin.settings.ribbonModalNoCommitsText = value;
                            await this.plugin.saveSettings();
                        }
                    ));

                new Setting(ribbonFormattingContainer)
                    .setName('Author Name CSS')
                    .setDesc('CSS for the author name. Default is:\ntext-align: left; font-size: 35px; color: var(--color-red); padding-left: 10px;')
                    .addTextArea(text => text
                        .setValue(this.plugin.settings.ribbonModalAuthorCSS)
                        .onChange(async (value) => {
                            this.plugin.settings.ribbonModalAuthorCSS = value;
                            await this.plugin.saveSettings();
                        }
                    ));

                new Setting(ribbonFormattingContainer)
                    .setName('File Name CSS')
                    .setDesc('CSS for the file name. Default is:\ntext-align: left; font-size: 25px; color: var(--text-normal);')
                    .addTextArea(text => text
                        .setValue(this.plugin.settings.ribbonModalFileNameCSS)
                        .onChange(async (value) => {
                            this.plugin.settings.ribbonModalFileNameCSS = value;
                            await this.plugin.saveSettings();
                        }
                    ));

                new Setting(ribbonFormattingContainer)
                    .setName('File Path CSS')
                    .setDesc('CSS for the file path. Default is:\ntext-align: left; font-size: 15px; color: var(--text-muted);')
                    .addTextArea(text => text
                        .setValue(this.plugin.settings.ribbonModalFilePathCSS)
                        .onChange(async (value) => {
                            this.plugin.settings.ribbonModalFilePathCSS = value;
                            await this.plugin.saveSettings();
                        }
                    ));

            }
 
        }

        if (this.plugin.settings.debugMode) {

            const debugContainer = containerEl.createDiv();
            debugContainer.createEl('h1', { text: 'Debug Settings' });

            new Setting(debugContainer)
                .setName('Cron Timer Debug')
                .setDesc('Log Cron Task Running Timer')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.cronDebugLogger)
                    .onChange(async (value) => {
                        this.plugin.settings.cronDebugLogger = value;
                        await this.plugin.saveSettings();
                    }));
            
            new Setting(debugContainer)
                .setName('Git Commit Debug')
                .setDesc('Log Git Commit Messages')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.commitDebugLogger)
                    .onChange(async (value) => {
                        this.plugin.settings.commitDebugLogger = value;
                        await this.plugin.saveSettings();
                    }));
        }

    }
}