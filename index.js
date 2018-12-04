var _ = require('lodash');

/*
    JSON Reporter that reports just the Summary Info
    Collection.Info.Name
    Run.Stats.Requests.*
    Run.Stats.Assertions.*
    Run.Timings.*
    Run.Failures[n].Parent.Name
    Run.Failures[n].Source.Name
    Run.Failures[n].Error.Message
    Run.Failures[n].Error.Test
 */

function createSummary(summary) {
    
    // Just pull out the miminum parts for each failure
    var failures = [];
    summary.run.failures.forEach(function(failure) {
        failures.push({
            'Parent': {
                'Name': failure.parent.name
            },
            'Source': {
                'Name': failure.source.name
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
                'Name': summary.collection.name
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
            path:  options.jsonSummaryExport,
            content: JSON.stringify(createSummary(data.summary))
        });
    });
};
