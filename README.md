[![CI/CD](https://github.com/vertigis/workflow-activities-quickbase/workflows/CI/CD/badge.svg)](https://github.com/vertigis/workflow-activities-quickbase/actions)
[![npm](https://img.shields.io/npm/v/@vertigis/workflow-activities-quickbase)](https://www.npmjs.com/package/@vertigis/workflow-activities-quickbase)

This project contains activities for accessing an organization's data via the Quickbase REST API. [Click here](https://developer.quickbase.com/) for more information on the resources and requests available via the Quickbase REST API.

## Requirements

These activities are designed to work with VertiGIS Studio Workflow versions `5.41.0` and above.

## Usage
To use these activities in [VertiGIS Studio Workflow Designer](https://apps.vertigisstudio.com/workflow/designer/) you need to register an activity pack and then add the activities to a workflow.

### Register the Quickbase activity pack

1. Sign in to ArcGIS Online or Portal for ArcGIS
1. Go to **My Content**
1. Select **Add Item > An application**
    - Type: `Web Mapping`
    - Purpose: `Ready To Use`
    - API: `JavaScript`
    - URL: The URL to this activity pack manifest
        - Use https://unpkg.com/@vertigis/workflow-activities-quickbase/activitypack.json for the latest version
        - Use https://unpkg.com/@vertigis/workflow-activities-quickbase@1.0.0/activitypack.json for a specific version
        - Use https://localhost:5000/activitypack.json for a local development version
    - Title: Your desired title
    - Tags: Must include `geocortex-workflow-activity-pack`
1. Reload [VertiGIS Studio Workflow Designer](https://apps.vertigisstudio.com/workflow/designer/)
1. These activities will now appear in the activity toolbox in a `Quickbase` category

### Use the Quickbase activities in a workflow

1. Authenticate with the Quickbase service
The quickbase connection requires a valid user token in order.  It is the responsibility of the Workflow implmentor to retreive and store the token.  [Click here](https://developer.quickbase.com/auth) for more information on how to generate a Quickbase user token.
    1. Add the `Create App Service` activity to a workflow
    1. Set the `URL` input to the root URL the Quickbase service. For example, `https://api.quickbase.com/v1`.
    1. Set the `Host Name` to your Quickbase domain.
    1. Set the `Access Token` to your valid User Token.
    1. Set the `Token Type` to 'QB-USER-TOKEN' or 'QB-TEMP-TOKEN', depending on your type of access token.
1. Use the Quickbase service
    1. Add one of the other Quickbase activities to the workflow. For example, `Get Table`.
    1. Set the `Service` input of the activity to be the output of the `Create App Service` activity
        - Typically this would use an expression like `=$service1.result`
    1. Supply any additional inputs to the activity
    1. Supply the `result` output of the activity to the inputs of other activities in the workflow
1. Run the workflow

## Development

This project was bootstrapped with the [VertiGIS Studio Workflow SDK](https://github.com/vertigis/vertigis-workflow-sdk). Before you can use your activity pack in the [VertiGIS Studio Workflow Designer](https://apps.vertigisstudio.com/workflow/designer/), you will need to [register the activity pack](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview#register-the-activity-pack).

## Available Scripts

Inside the newly created project, you can run some built-in commands:

### `npm run generate`

Interactively generate a new activity or form element.

### `npm start`

Runs the project in development mode. Your activity pack will be available at [http://localhost:5000/main.js](http://localhost:5000/main.js). The HTTPS certificate of the development server is a self-signed certificate that web browsers will warn about. To work around this open [`https://localhost:5000/main.js`](https://localhost:5000/main.js) in a web browser and allow the invalid certificate as an exception. For creating a locally-trusted HTTPS certificate see the [Configuring a HTTPS Certificate](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview/#configuring-a-https-certificate) section on the [VertiGIS Studio Developer Center](https://developers.vertigisstudio.com/docs/workflow/overview/).

### `npm run build`

Builds the activity pack for production to the `build` folder. It optimizes the build for the best performance.

Your custom activity pack is now ready to be deployed!

See the [section about deployment](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview/#deployment) in the [VertiGIS Studio Developer Center](https://developers.vertigisstudio.com/docs/workflow/overview/) for more information.

## Documentation

Find [further documentation on the SDK](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview/) on the [VertiGIS Studio Developer Center](https://developers.vertigisstudio.com/docs/workflow/overview/)
