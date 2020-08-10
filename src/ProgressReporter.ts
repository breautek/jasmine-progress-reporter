
import {Bar, Presets} from "cli-progress";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IConfiguration {}

interface IRunDetails extends jasmine.RunDetails {
    overallStatus: string;
    totalTime: number;
}

export class ProgressReporter implements jasmine.CustomReporter {
    private _configuration: IConfiguration;
    private _progress: Bar;
    private _progressValue: number;
    private _failedSpecs: Array<jasmine.CustomReporterResult>;

    constructor(configuration?: IConfiguration) {
        this._configuration = configuration;
        this._progressValue = 0;
        this._progress = new Bar({
            format: "[{bar}] {value}/{total}     {text}"
        }, Presets.shades_classic);
        this._failedSpecs = [];
    }

    public jasmineStarted(suiteInfo: jasmine.SuiteInfo): void {
        this._progress.start(suiteInfo.totalSpecsDefined, 0, {
            text: 'Jasmine Started'
        })
    }

    public jasmineDone(runDetails: IRunDetails): void {
        this._progress.stop();
        console.log('');
        console.log(`Test ${runDetails.overallStatus} after ${this._formatDuration(runDetails.totalTime)}.`);
        console.log('');

        if (this._failedSpecs.length > 0) {
            console.log('FAILURES:');
            for (let i: number = 0; i < this._failedSpecs.length; i++) {
                let failedSpec: jasmine.CustomReporterResult = this._failedSpecs[i];
                console.log(`${failedSpec.fullName}:`);
                for (let j: number = 0; j < failedSpec.failedExpectations.length; j++) {
                    let expectation: jasmine.FailedExpectation = failedSpec.failedExpectations[j];
                    console.log(expectation.stack);
                    console.log('');
                }
            }
        }
    }

    public suiteStarted(result: jasmine.CustomReporterResult): void {
        this._progress.update(this._progressValue, {
            text: result.fullName
        });
    }

    public specStarted(result: jasmine.CustomReporterResult): void {
        this._progress.update(this._progressValue, {
            text: result.fullName
        });
    }

    public specDone(result: jasmine.CustomReporterResult): void {
        this._progress.update(++this._progressValue, {
            text: result.fullName
        });
        
        if (result.status === 'failed') {
            this._failedSpecs.push(result);
        }
    }

    private _pluralize(count: number): string {
        return count > 1 ? "s" : "";
    }

    private _formatDuration(durationInMs: number): string {
        let duration: string = "";
        let durationInSecs: number = durationInMs / 1000;
        let durationInMins: number;
        let durationInHrs: number;
        if (durationInSecs < 1) {
            return `${durationInSecs} sec${this._pluralize(durationInSecs)}`;
        }
        durationInSecs = Math.round(durationInSecs);
        if (durationInSecs < 60) {
            return `${durationInSecs} sec${this._pluralize(durationInSecs)}`;
        }
        durationInMins = Math.floor(durationInSecs / 60);
        durationInSecs = durationInSecs % 60;
        if (durationInSecs) {
            duration = ` ${durationInSecs} sec${this._pluralize(durationInSecs)}`;
        }
        if (durationInMins < 60) {
            return `${durationInMins} min${this._pluralize(durationInMins)}${duration}`;
        }
        durationInHrs = Math.floor(durationInMins / 60);
        durationInMins = durationInMins % 60;
        if (durationInMins) {
            duration = ` ${durationInMins} min${this._pluralize(durationInMins)}${duration}`;
        }
        return `${durationInHrs} hour${this._pluralize(durationInHrs)}${duration}`;
    }
}
