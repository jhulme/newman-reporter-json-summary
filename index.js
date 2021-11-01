var _ = require('lodash');

/*
    JSON Reporter that reports just the Summary Info
    Collection.Info.Name
    Collection.Info.Id
    Run.Stats.Requests.*
    Run.Stats.Assertions.*
    Run.Timings.*
    Run.Failures[n].Parent.Name
    Run.Failures[n].Parent.Id
    Run.Failures[n].Source.Name
    Run.Failures[n].Source.Id
    Run.Failures[n].Error.Message
    Run.Failures[n].Error.Test
 */

function createSummary(summary) {
    // Filter the summary and kick out any failures found that have no parent defined (e.g failures issued from pre-request script execution)
    // summary.run.failures.forEach(function(failure) {
    //     console.log(`Scanning for Bad Parents.`)
    //     if (_.isUndefined(failure.parent)) {
    //         console.log(`Bad Parent detected. Removing.`)
    //         _.pull(summary.run.failures, failure)
    //     }
    // })

    let undefs = _.remove(summary.run.failures, function(f) {
        return _.isUndefined(f.parent)
    })

    console.log(`RUN FAILURES: ${summary.run.failures}`)
    console.log(`UNDEFS${undefs}`)

    // Just pull out the miminum parts for each failure
    var failures = [];
    summary.run.failures.forEach(function(failure) {
        failures.push({
            'Parent': {
                'Name': failure.parent.name,
                'Id' : failure.parent.id
            },
            'Source': {
                'Name': failure.source.name,
                'Id' : failure.source.id
            },
            'Error': {
                'Message': failure.error.message,
                'Test' : failure.error.test
            }
        });
    });

    // Build main object with just the bits needed plus the slimmed down failures
    var result = {};
    Object.assign(result, {
        'Collection': {
            'Info': {
                'Name': summary.collection.name,
                'Id': summary.collection.id
            }
        },
        'Run': {
            'Stats': {
                "Requests" : summary.run.stats.requests,
                "Assertions" : summary.run.stats.assertions
            },
            'Failures': failures,
            'Timings' : summary.run.timings
        }
    });
    return result;
}

module.exports = function(newman, options) {
    newman.on('beforeDone', function(err, data) {
        if (err) { return; }

        newman.exports.push({
            name: 'newman-reporter-json-summary',
            default: 'summary.json',
            path:  options.summaryJsonExport,
            content: JSON.stringify(createSummary(data.summary))
        });
    });
};
