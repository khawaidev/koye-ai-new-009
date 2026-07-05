

## OVERVIEW:

# Overview

This page provides a quick map of all task categories and their corresponding tasks. Click any card to open detailed API docs.

## Image generation

<div class="task-card-grid">
  <a class="task-card" href="/image-generation/basic-text-to-image">
    <h3>Basic text to image</h3>
    <p>Generate an image from a text prompt with a lightweight request payload.</p>
  </a>
  <a class="task-card" href="/image-generation/advanced-image-generation">
    <h3>Advanced image generation</h3>
    <p>Generate or edit images with richer controls, model options, and references.</p>
  </a>
  <a class="task-card" href="/image-generation/multiview-image">
    <h3>Multiview image</h3>
    <p>Generate or edit multi-view image sets for downstream 3D workflows.</p>
  </a>
</div>

## Model generation

<div class="task-card-grid">
  <div class="task-card">
    <h3>Image to model</h3>
    <p>Convert a single image into a 3D model with optional texture and topology controls.</p>
    <ul class="task-card-links">
      <li><a href="/model-generation/image-to-model-p1-20260311"><strong>P1</strong> Optimized low-poly topology and structured mesh output.</a><div class="task-version-preview"><img src="/images/overview-p1.webp" alt="P1 preview" /><div class="task-version-preview__body"><div class="task-version-preview__title">P1</div><p>Optimized low-poly topology and structured mesh output.</p></div></div></li>
      <li><a href="/model-generation/image-to-model-v3-0-v3-1"><strong>H3</strong> High-fidelity generation with full parameter surface.</a><div class="task-version-preview"><img src="/images/overview-H3.webp" alt="H3 preview" /><div class="task-version-preview__body"><div class="task-version-preview__title">H3</div><p>High-fidelity generation with full parameter surface.</p></div></div></li>
      <li><a href="/model-generation/image-to-model-v2-0-v2-5"><strong>H2</strong> Stable 2.x baseline for production (same parameters).</a><div class="task-version-preview"><img src="/images/overview-H3.webp" alt="H2 preview" /><div class="task-version-preview__body"><div class="task-version-preview__title">H2</div><p>Stable 2.x baseline for production (same parameters).</p></div></div></li>
    </ul>
  </div>
  <div class="task-card">
    <h3>Text to model</h3>
    <p>Generate a 3D model directly from a text prompt for rapid concepting.</p>
    <ul class="task-card-links">
      <li><a href="/model-generation/text-to-model-p1-20260311"><strong>P1</strong> Best low-poly quality from prompt-only input.</a><div class="task-version-preview"><img src="/images/overview-p1.webp" alt="P1 preview" /><div class="task-version-preview__body"><div class="task-version-preview__title">P1</div><p>Best low-poly quality from prompt-only input.</p></div></div></li>
      <li><a href="/model-generation/text-to-model-v3-0-v3-1"><strong>H3</strong> Latest text-to-3D lines including geometry quality options.</a><div class="task-version-preview"><img src="/images/overview-H3.webp" alt="H3 preview" /><div class="task-version-preview__body"><div class="task-version-preview__title">H3</div><p>Latest text-to-3D lines including geometry quality options.</p></div></div></li>
      <li><a href="/model-generation/text-to-model-v2-0-v2-5"><strong>H2</strong> Compatible 2.x baseline (same parameters).</a><div class="task-version-preview"><img src="/images/overview-H3.webp" alt="H2 preview" /><div class="task-version-preview__body"><div class="task-version-preview__title">H2</div><p>Compatible 2.x baseline (same parameters).</p></div></div></li>
    </ul>
  </div>
  <div class="task-card">
    <h3>Multiview to model</h3>
    <p>Build a model from multiple directional images for stronger geometry consistency.</p>
    <ul class="task-card-links">
      <li><a href="/model-generation/multiview-to-model-p1-20260311"><strong>P1</strong> Refined low-poly mesh from multiview inputs.</a><div class="task-version-preview"><img src="/images/overview-p1.webp" alt="P1 preview" /><div class="task-version-preview__body"><div class="task-version-preview__title">P1</div><p>Refined low-poly mesh from multiview inputs.</p></div></div></li>
      <li><a href="/model-generation/multiview-to-model-v3-0-v3-1"><strong>H3</strong> Stronger multiview detail and geometry quality options.</a><div class="task-version-preview"><img src="/images/overview-H3.webp" alt="H3 preview" /><div class="task-version-preview__body"><div class="task-version-preview__title">H3</div><p>Stronger multiview detail and geometry quality options.</p></div></div></li>
      <li><a href="/model-generation/multiview-to-model-v2-0-v2-5"><strong>H2</strong> Stable 2.x multiview workflow (same parameters).</a><div class="task-version-preview"><img src="/images/overview-H3.webp" alt="H2 preview" /><div class="task-version-preview__body"><div class="task-version-preview__title">H2</div><p>Stable 2.x multiview workflow (same parameters).</p></div></div></li>
    </ul>
  </div>
  <div class="task-card">
    <h3>Import model</h3>
    <p>Import existing 3D assets into the pipeline for post-processing and export.</p>
    <ul class="task-card-links">
      <li><a href="/model-generation/import-model">Version-independent import entry.</a></li>
    </ul>
  </div>
</div>

## Texture

<div class="task-card-grid task-card-grid--half">
  <div class="task-card">
    <h3>Texture model</h3>
    <p>Generate or refine texture and PBR outputs for existing 3D models.</p>
    <ul class="task-card-links">
      <li><a href="/texture/texture-model-v3-0-20250812"><strong>v3.0-20250812</strong> Latest texture pipeline and 4K upgrade support.</a></li>
      <li><a href="/texture/texture-model-v2-5-20250123"><strong>v2.5-20250123</strong> Stable texture baseline for production.</a></li>
    </ul>
  </div>
</div>

## Mesh editing

<div class="task-card-grid">
  <div class="task-card">
    <h3>Mesh segmentation</h3>
    <p>Split a mesh into semantic parts for selective edits and downstream operations.</p>
    <ul class="task-card-links">
      <li><a href="/mesh-editing/mesh-segmentation-v1-0-20250506"><strong>v1.0-20250506</strong></a></li>
    </ul>
  </div>
  <div class="task-card">
    <h3>Mesh completion</h3>
    <p>Merge segmented parts back into a unified model after part-level workflows.</p>
    <ul class="task-card-links">
      <li><a href="/mesh-editing/mesh-completion-p-v2-0-20251225"><strong>P-v2.0-20251225</strong> Latest completion model quality.</a></li>
      <li><a href="/mesh-editing/mesh-completion-v1-0-20250506"><strong>v1.0-20250506</strong> Legacy compatible completion flow.</a></li>
    </ul>
  </div>
  <div class="task-card">
    <h3>Smart low poly</h3>
    <p>Produce lightweight low-poly assets while preserving shape and key features.</p>
    <ul class="task-card-links">
      <li><a href="/mesh-editing/smart-low-poly-p-v2-0-20251225"><strong>P-v2.0-20251225</strong> Current low-poly model with improved quality.</a></li>
      <li><a href="/mesh-editing/smart-low-poly-v1-0-20250506"><strong>v1.0-20250506</strong> Deprecated legacy low-poly model.</a></li>
    </ul>
  </div>
</div>

## Animation

<div class="task-card-grid">
  <div class="task-card">
    <h3>Pre rig check</h3>
    <p>Validate riggability and suggested rig type before running auto-rig.</p>
    <ul class="task-card-links">
      <li><a href="/animation/pre-rig-check-v2-0-20250506"><strong>v2.0-20250506</strong> Newer animation pipeline precheck entry.</a></li>
      <li><a href="/animation/pre-rig-check-v1-0-20240301"><strong>v1.0-20240301</strong> Legacy animation pipeline precheck entry.</a></li>
    </ul>
  </div>
  <div class="task-card">
    <h3>Rig</h3>
    <p>Auto-generate skeletal rigs for supported characters and creatures.</p>
    <ul class="task-card-links">
      <li><a href="/animation/rig-v2-5-20260210"><strong>v2.5-20260210</strong> Recommended for current rig workflows.</a></li>
      <li><a href="/animation/rig-v1-0-20240301"><strong>v1.0-20240301</strong> Legacy rig behavior for compatibility.</a></li>
    </ul>
  </div>
  <div class="task-card">
    <h3>Retarget</h3>
    <p>Apply preset motion clips to rigged models for animation-ready exports.</p>
    <ul class="task-card-links">
      <li><a href="/animation/retarget">Preset motions and optional batching with the <code>animations</code> array.</a></li>
    </ul>
  </div>
</div>

## Export

<div class="task-card-grid">
  <a class="task-card" href="/export/conversion">
    <h3>Conversion</h3>
    <p>Export models into downstream formats such as GLTF, USDZ, FBX, OBJ, STL, and 3MF.</p>
  </a>
</div>


## PRICING:

# Pricing
Triop API for generation is a pay-before-you-go product. You need to purchase API usage based on your application's need before using Tripo API. You can purchase API usage from the platform dashboard page. For volume API pricing and custom contracts, please contact sales.

The Tripo API pricing is based on credits. Here's a detailed breakdown of the API pricing, some tasks will have additional credits consumed, you can check it in detailed task type:

| Image generation task | Base credit |
| --- | --- |
| Basic text to image | 5 | 
| Advanced image generation — `model_version`: `flux.1_kontext_pro`, `flux.1_dev`, `gpt_4o`, `gemini_2.5_flash_image_preview` | 5 |
| Advanced image generation — `model_version`: `gpt_image_1.5`, `gpt_image_2`, `midjourney`, `gemini_3_pro_image_preview`, `gemini_3.1_flash_image_preview` | 10 |
| Generate multiview image | 10 |
| Edit multiview image | 5 per view |

<div style="border: 1px solid var(--vp-c-divider); margin: 0 auto; padding: 8px 12px;">
  <div style="text-align: center; padding: 8px 12px; font-weight: 600;">
    Generate model phase
  </div>
  <div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start; flex-wrap: wrap;">
    <div>
      <table>
        <thead>
          <tr>
            <th rowspan="2">Task type</th>
            <th colspan="2" style="text-align:center;">H2 / H3</th>
            <th colspan="2" style="text-align:center;">P1</th>
          </tr>
          <tr>
            <th>No texture</th>
            <th>+ texture</th>
            <th>No texture</th>
            <th>+ texture</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Image to model</td><td>20</td><td>30</td><td>40</td><td>50</td></tr>
          <tr><td>Text to model</td><td>10</td><td>20</td><td>30</td><td>40</td></tr>
          <tr><td>Multiview to model</td><td>20</td><td>30</td><td>40</td><td>50</td></tr>
          <tr><td>Import model</td><td>Free</td><td>—</td><td>—</td><td>—</td></tr>
        </tbody>
      </table>
    </div>
    <div>
      <table>
        <thead>
          <tr><th><code>texture_quality</code> (H2 / H3 and P1)</th><th>credit</th></tr>
        </thead>
        <tbody>
          <tr><td><code>standard</code></td><td>10</td></tr>
          <tr><td><code>detailed</code></td><td>20</td></tr>
          <tr><td><code>extreme</code></td><td>30</td></tr>
        </tbody>
      </table>
      <table style="margin-top: 12px;">
        <thead>
          <tr><th>H2 / H3 only</th><th>credit</th></tr>
        </thead>
        <tbody>
          <tr><td><code>smart_low_poly</code>=<code>true</code></td><td>10</td></tr>
          <tr><td><code>quad</code>=<code>true</code></td><td>5</td></tr>
          <tr><td><code>generate_parts</code>=<code>true</code></td><td>20</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  <div style="padding: 4px 12px 8px; color: var(--vp-c-text-2); font-size: 12px;">
    P1 uses all-in base pricing per task; other H2 / H3 surcharges do not apply to P1. <code>texture_quality</code> surcharges (<code>standard</code> +10, <code>detailed</code> +20, <code>extreme</code> +30) also apply to P1.
  </div>
</div>


<div style="border: 1px solid var(--vp-c-divider); margin: 0 auto; padding: 8px 12px;">
  <div style="text-align: center; padding: 8px 12px; font-weight: 600;">
    Texture model phase
  </div>
  <div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start;">
    <div>
      <table>
        <thead>
          <tr><th>Task type</th><th>Base credit</th></tr>
        </thead>
        <tbody>
          <tr><td>Texture model</td><td>10</td></tr>
        </tbody>
      </table>
    </div>
    <div>
      <table>
        <thead>
          <tr><th>Additional parameters</th><th>credit</th></tr>
        </thead>
        <tbody>
          <tr><td><code>texture_quality</code>=<code>standard</code></td><td>10</td></tr>
          <tr><td><code>texture_quality</code>=<code>detailed</code></td><td>20</td></tr>
          <tr><td><code>texture_quality</code>=<code>extreme</code></td><td>30</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>


| Other post process task | Base credit |
| --- | --- |
| Mesh segmentation| 40 |
| Mesh completion | 50 |
| Smart low poly | 30 |
| pre rig check | Free |
| Rig | 25 |
| Retarget | 10 per animate |

<div style="border: 1px solid var(--vp-c-divider); margin: 0 auto; padding: 8px 12px;">
  <div style="text-align: center; padding: 8px 12px; font-weight: 600;">
    Export model phase
  </div>
  <div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start;">
    <div>
      <table>
        <thead>
          <tr><th>Task type</th><th>Base credit</th></tr>
        </thead>
        <tbody>
          <tr><td>Conversion</td><td>5</td></tr>
        </tbody>
      </table>
    </div>
    <div>
      <table>
        <thead>
          <tr><th>Additional parameters setting result in 5 more credits</th></tr>
        </thead>
        <tbody>
          <tr><td><code>quad</code>=<code>true</code></td></tr>
          <tr><td><code>face_limit</code></td></tr>
          <tr><td><code>flatten_bottom</code>=<code>true</code></td></tr>
          <tr><td><code>flatten_bottom_threshold</code></td></tr>
          <tr><td><code>texture_size</code></td></tr>
          <tr><td><code>texture_format</code></td></tr>
          <tr><td><code>pivot_to_center_bottom</code>=<code>true</code></td></tr>
          <tr><td><code>scale_factor</code></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>


## Base conversion rate

$1.00 = 100 credits

Get started with 300 free credits in 2 weeks. Manage and purchase redits on your [API account billing page](https://platform.tripo3d.ai/billing)

## Checking actual credit consumption

When you query a task via `GET /v2/openapi/task/{task_id}`, the response includes a `consumed_credit` field showing the exact number of credits deducted for that task. Use this to verify billing or reconcile usage in your application.



## ERROR RESPONSES AND HANDLING:

# Errors

In this guide, we will talk about what happens when something fails in your work with Tripo API.

## Error response

Whenever a request is unsuccessful, Tripo API will return an error response with an error code, description and suggestion. You can use this information to understand better what has gone wrong and how to fix it. Most of the error messages should be helpful and actionable, they also share a common json structure:

```json
{
  "code": 1004,
  "message": "One or more of your parameter is invalid",
  "suggestion": "Refer to the API documentation for parameter requirements"
}
```

During your task query process, some tasks may fail. An error code will also be returned to make the reason clear:

```json
{
  "code": 0,
  "data": {
    "task_id": "916ef2cf-02e5-4bed-97f3-d8a8196f7dfc",
    "type": "text_to_model",
    "status": "failed",
    "input": {
      "prompt": "A dachshund standing on a stool.",
      "model_version": "v2.5-20250123"
    },
    "output": {},
    "progress": 100,
    "create_time": 1768888519,
    "error_code": 1001,
    "prompt": "a dog",
    "queuing_num": -1,
    "running_left_time": -1,
    "result": {}
  }
}
```

## Refer to Trace-Id in headers

All responses, whether successful or unsuccessful, include a standard header field named `X-Tripo-Trace-ID` in UUID.

This ID is randomly generated for each request. We recommend logging this value for tracking purposes.

In the event of an error, please provide this ID when reporting the issue to us for a more effective investigation.

Here is example response headers:

```txt
HTTP/1.1 200 OK
Content-Type: application/json
X-Tripo-Trace-ID: 20516a36-f45c-4454-83c8-45877b75eac8
...
```

## Error code list

| HTTP status code | Code | Message | Suggestion |
| --- | --- | --- | --- |
| 500 | 1000 | Unknown error on sever side | Please contact the support with request id |
| 500 | 1001 | Fatal error on server side | Please contact the support with request id |
| 401 | 1002 | Authentication failed | Check if your credentials is valid, and ensure you set it correctly |
| 400 | 1003 | The request body is malformed | Refer to the API documentation for request schema |
| 400 | 1004 | One or more of your parameter is invalid | Refer to the API documentation for parameter requirements |
| 403 | 1005 | You are not allowed to access this resource | Check if you have sufficent permission |
| 429 | 1007 | Rate limit exceeded, you've generated too many requests in a short amount of time | Please wait for a while and try again |
| 429 | 2000 | You have exceeded the limit of generation | Try again later. You can also check `Retry-After` header. |
| 404 | 2001 | The task is not found | Check if the task is committed by you or whether the format is correct |
| 400 | 2002 | This task type is not supported | Refer to API documentation for supported task types |
| 400 | 2003 | The image file is empty | Check if the file is corrupted |
| 400 | 2004 | This image file type is not supported | Refer to API documentation for supported image file types |
| 400 | 2005 | The draft task is not a success task | Retry with a success draft task |
| 400 | 2006 | The original task type is not supported | Retry with a task with supported task type |
| 400 | 2007 | The original task is not a succeeded task | Retry with a succeeded task |
| 400 | 2008 | The input is rejected due to violation of content policy | Please modify your input and retry |
| 400 | 2009 | The input prompt contains invalid characters | Please modify your input and retry |
| 403 | 2010 | You don't have enough credit to create this task | Please purchase more credit |
| 400 | 2011 | The input task type cannot be prerigcheck without model | Please provide a task with output containing a model |
| 400 | 2012 | The input task type is not valid | Please provide a rig task |
| 403 | 2013 | The priority is invalid | Contact the support if you need higher priority |
| 400 | 2014 | Error occurred when auditing | Please contact us for further suggestion |
| 400 | 2015 | The version has been deprecated, please try higher version | Try higher version please |
| 400 | 2016 | The request type has been deprecated | Try other available types please |
| 400 | 2017 | The version value is valid | Try correct version please |
| 400 | 2018 | The model is too complex to remesh | Please try another model |
| 404 | 2019 | The file is not found | Check uploading response to ensure if the file has uploaded successfully |

## RATE LIMITS:

# Rate limits

## Generation Rate Limit

We have a concurrency limit, which restricts the number of tasks that can be executed simultaneously.

| **Task Scope** | **Limit** |
| --- | --- |
| `text_to_model`, `image_to_model`, `multiview_to_model` with `model_version = P1-20260311` | 5 |
| `text_to_model`, `image_to_model`, `multiview_to_model` with other model versions | 10 |
| `refine_model` | 5 |
| `animate_model` | 10 |
| `animate_prerigcheck` | 10 |
| `animate_rig` | 10 |
| `animate_retarget` | 10 |
| `generate_multiview_image` | 1 |
| `edit_multiview_image` | 1 |
| Other task types | 10 |

Limits are calculated by concurrency group, not by each raw task type.
For example, `text_to_model` and `image_to_model` with non-`P1-20260311` model versions share the same concurrency bucket.

If you exceed the threshold, the API will return the error below.

```json
{
  "code": 2000,
  "message": "You have exceeded the limit of generation",
  "suggestion": "Try again later. You can also check `Retry-After` header."
}
```

We recommend implementing an exponential backoff strategy in your code to handle these responses gracefully.

## Upload Rate Limit

For uploading images, we offer a **10** qps limitation.

## CHANGELOGS:

# Changelog

## 1.9.7 (2026-06-03)

- **Removed**: Documentation for `animate_rig` model version `v2.0-20250506`. Use `v2.5-20260210` instead.
- **Added**: `texture_quality` option `extreme` for generation and texture tasks.
- **Modified**: `texture_quality` additional credits — `standard` `10`, `detailed` `20`, `extreme` `30`.

## 1.9.6 (2026-04-14)

### Multiview Image Workflow Expansion

We've expanded multiview image support to improve 3D asset generation pipelines and reduce manual preprocessing.

### New task types

- Added `generate_multiview_image` and `edit_multiview_image`, enabling generation of multi-view image sets of the same subject from a single input image, suitable for 3D reconstruction workflows (e.g. model generation).
- Each generated view can be edited independently, enabling targeted refinements without regenerating the full multiview set.
- Dedicated endpoint documentation available at: `generate-multiview-image.md`

### Improved pipeline integration

- `multiview_to_model` now accepts an optional parameter: `original_task_id`.
- This allows direct chaining from multiview generation/edit tasks without re-uploading image files.
- Constraint:
  - `files` and `original_task_id` are mutually exclusive.
  - `original_task_id` only supports outputs from:
    - `generate_multiview_image`
    - `edit_multiview_image`
- This simplifies pipelines where multiview images are generated programmatically.

### Documentation updates

- Standardized multiview task output schema under: `task.md`.
- Updated billing documentation for the new task types.
- Updated schema definitions for consistency across multiview endpoints.

## 1.9.5 (2026-03-11)

### New Models Available

- **Tripo v3.1**: Released Tripo v3.1 for high-fidelity 3D generation, supporting up to 2M polygons for 3D printing, hero assets, and high-detail visuals.

- **Tripo P1.0**: Released P1-20260311, a new Smart Mesh model for structured mesh generation, optimized for clean topology, ~2s mesh generation, and real-time production workflows.
  P1-20260311 supports only selected generation parameters. Unsupported parameters will return an error. <a href="../docs/generation#p1-20260311" style="text-decoration: underline; margin-left: 20px">See the parameter documentation for details.</a>

- **Tripo Rig v2.5**

## 1.9.4 (2026-03-09)

- **Large Image Handling Fix**: Fixed an issue where generation could fail when the input image resolution or size was too large.

- **Autofix Optimization**: Improved the autofix parameter in the model generation API, enabling better handling of common image issues, including blurry inputs, incomplete image information, and similar cases.

- **Credit Usage in Task Response**: Successful responses for credit-consuming tasks now include credit usage for that specific request, making it easier for developers to track and manage usage.

## 1.9.3 （2025-12-30）

- **Performance Enhancement**: Significantly accelerated generation speed for Tripo v3.0 base geometry models, reducing processing time for untextured mesh output.
- **Texture Quality Improvement**: Optimized the texturing pipeline for Tripo v3.0, delivering enhanced color accuracy, improved surface detail fidelity, and more refined material representation.
- **Low-Poly Model Addition**: Introduced Tripo v2.0 low-polygon model generation with enhanced quality, offering improved geometric topology and better preservation of key features at reduced polygon counts.

## 1.9.2 （2025-11-04）

- Multiview-to-model is now supported with Tripo v3.0 (Standard & Ultra)

## 1.9.1 (2025-09-26)

- **Tripo v3.0 Official Launch**:
  - The Tripo v3.0 model introduces significant enhancements in geometric interpretation and output. Assets now generate with crisper edges, cleaner surfaces, and an unparalleled level of structural coherence.
  - Ultra Mode unlocks the ability to generate assets with up to 2 million polygons, capturing maximum detail and fidelity for the most demanding creations. Set `geometry_quality` to `detailed` to try.
  - The texturing and material generation pipeline has been substantially upgraded for more accurate and physically-based results.
  - Clarity and precision for fine details, including embedded text and complex patterns on surfaces, have been greatly improved.
  - Materials now exhibit more accurate light interaction, with well-balanced colors and natural surface finishes suitable for modern PBR pipelines.
- **Improvements Since Beta**
  - The geometry generation model has been refined for improved structural soundness. This results in more coherent details and superior handling of complex forms.
  - The geometry generation process has been optimized to resolve critical issues, including the elimination of double-layer surface artifacts. We have also improved surface continuity to significantly reduce the occurrence of gaps or holes
  - Better texture–image alignment, ensuring higher color fidelity

## 1.9.0 (2025-08-12)

- **Added**:
  - New version `v3.0-20250812` (BETA). The detail restoration is greatly improved, the edges are sharper, the hard surface support is better
  - Texture Gen Updated to `v3.0-20250812` (BETA). Clarity and realism are both improved, and text rendering capabilities are enhanced.
  - PBR Generator Enhanced. Present more realistic material textures and make the model more tangible

## 1.8.0 (2025-06-18)

This release focuses on migrating Studio's core algorithm capabilities to the OpenAPI and introducing significant feature enhancements.

- **Added**:
  - Introduced new mesh editing task types: `mesh_segmentation`, `smart_low_poly`, and `mesh_completion`. Refer to [Mesh Editing](https://platform.tripo3d.ai/docs/editing) for more details.
  - Added `text_to_image` task type for generating images from text prompts.
  - Enhanced `text_to_model`, `image_to_model`, and `multiview_to_model` tasks with `smart_low_poly` and `generate_parts` parameters for finer control over model generation.
  - The `convert` task now supports additional parameters for advanced customization.
  - All generation task types now support the `compress` parameter for output optimization.
  - The `texture_model` task now includes a `prompt` parameter, accepting `text` prompt, `image` prompt, and `style_image` as style reference for precise control over texture generation.
  - Added the `animations` parameter to the `retarget` task, allowing multiple animations in a single request.
  - The `pre_rig_check` task now returns a `rig_type` 
  - The `animate_rig` task now accepts  parameter `spec` (options: `mixamo` or `tripo`) and `rig_type` to specify the rigging method

- **Modified**:
  - Refactored the API schema documentation (`schema.md`) for improved clarity and organization.


## 1.6.0 (2025-05-21)

- **Added**: New model `Turbo-v1.0-20250506` for text-to-model and image-to-model generation featuring significantly faster processing speed, optimized for time-sensitive applications.
- **Modified**: Refactored schema.md for improved clarity and organization.

## 1.5.0 (2025-01-23)

- **Added**: New version `v2.5-20250123` featuring enhanced geometry details and realistic textures.
- **Added**: Two new styles: `gold` and `ancient_bronze`.
- **Added**: `quad` parameter for generation interfaces.
- **Modified**: Default version changed from `v1.4-20240625` to `v2.5-20250123`.
- **Deprecated**: Version `v1.3-20240522` and multiview generation of version `1.4-20240522` are now deprecated.

## 1.4.9 (2024-12-06)

- **Added**: `orientation` parameter for `image_to_model` and `multiview_to_model`.
- **Added**: Additional preset animations for retargeting.
- **Added**: Two new styles and style improvements.

## 1.4.8 (2024-11-20)

- **Added**: `style` parameter for `text_to_model` generation.
- **Added**: `auto_size` parameter for `text_to_model`, `image_to_model`, and `multiview_to_model`.
- **Modified**: Conversion format can now be performed based on a previously converted model.
- **Modified**: `face_limit` for conversion can now be applied without requiring `quad`.

## 1.4.7 (2024-11-12)

- **Added**: `url` support for `image_to_model` and `multiview_to_model` generation.

## 1.4.6 (2024-11-11)

- **Added**: `style` parameter for `image_to_model` generation.
- **Added**: `v2.0-20240919` support for `multiview_to_model` generation.
- **Added**: New `texture_model` endpoint.
- **Added**: `texture_alignment` for `image_to_model`, `multiview_to_model`, and `texture_model`.
- **Added**: `texture_quality` for `text_to_model`, `image_to_model`, `multiview_to_model`, and `texture_model`.

## 1.4.5 (2024-10-12)

- **Added**: Support for `3mf` conversion format.

## 1.4.4 (2024-09-19)

- **Added**: Completely new algorithm version (`v2.0-20240919`).
- **Added**: Ability to watch all tasks since the last check.
- **Added**: `scale_factor` parameter for `convert`.

## 1.4.2 (2024-09-02)

- **Added**: `Multiview to Model` method.
- **Added**: `Check Balance` endpoint.
- **Added**: New parameters for post-processing.

## 1.1.2 (2024-07-30)

- **Added**: Streaming methods for retrieving models.
- **Modified**: Replaced `model` with `model_version` for specifying model versions.
- **Modified**: Simplified error codes.

## 1.1.1 (2024-07-09)

- **Added**: New parameters for various endpoints.
- **Added**: Model version support for draft generation.

## 1.1.0 (2024-05-06)

- **Added**: New parameters for various endpoints.
- **Modified**: Split the animation API into three separate endpoints.
- **Modified**: Removed callbacks for stylizing and conversion; now using polling instead.

## 1.0.0 (2024-04-08)

- **Added**: The first API billing plan, including pricing and FAQ.

## 0.2.0-beta (2024-02-27)

- **Added**: New API version and endpoint changes.
- **Added**: Improved documentation.

## 0.1.1-beta (2024-01-09)

- **Added**: Initial release of the Image to 3D API.
- **Modified**: Enhancements to expression parsing and API schema.

## 0.1.0-beta (2024-01-03)

- **Initial Release**: The first version of our API.

## FILE UPLOADS:

# UPLOAD DIRECTLY:

# Upload raw file directly

This part describes the detailed method for uploading files to our server directly. The request body should be in multipart form and Content-Type in the HTTP Header should be `multipart/form-data`.

The upload process typically completes within a few seconds.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/upload/sts`

## Parameters
### Required parameters

`file`: The image you would like to upload. Accepted file types are webp, jpeg and png only. Model files are not supported in this endpoint. 

> **Caution**
> The file should not be larger than 20 MB.

## Returns

`image_token`: The identifier returned for the successfully uploaded image.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/upload/sts`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/upload/sts' \
-H 'Content-Type: multipart/form-data' \
-H "Authorization: Bearer ${APIKEY}" \
-F "file=@cat.jpeg"
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/upload/sts"

headers = {
    "Authorization": f"Bearer {api_key}"
}

file_path = 'cat.jpeg'

with open(file_path, 'rb') as f:
    files = {'file': (file_path, f, 'image/jpeg')}
    response = requests.post(url, headers=headers, files=files)

print(response.json())
```
```js
import fs from 'fs';

const apiKey = "tsk_***";
const url = "https://api.tripo3d.ai/v2/openapi/upload/sts";

const filePath = 'cat.jpeg';

async function uploadImage() {
  try {
    const buffer = fs.readFileSync(filePath);
    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: 'image/jpeg' }));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
        console.log (response);
      throw new Error(`Error uploading image: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Response JSON:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

uploadImage();
```

```json
{
  "code": 0,
  "data": {
    "image_token": "ce85f375-3ccc-440b-b847-571588872ec2"
  }
}
```

## TASK QUERY:

# Get your task result 

This endpoint retrieves the details and current status of a specific task by its unique task ID. Use this endpoint to poll the progress of your submitted tasks (such as `image generation`, `text-to-model`, `image-to-model` etc.) and obtain the final results once the task is completed.

## Endpoint

`GET https://api.tripo3d.ai/v2/openapi/task/:task_id`

## Parameters
### Required path param
`task_id`: The task id returned from your created tasks.

## Returns

`task_id`: The unique identifier for the task, which should match the identifier used in the request.

`type`: Specifies the type of the task.

`status`: Reflects the current status of the task, categorized into two types: finalized (indicating no further updates for this task) and ongoing. There are eight possible status values:
  - Ongoing
    - `queued`: The task is awaiting its turn for processing.
    - `running`: The task is currently ongoing.
  - Finalized
    - `success`: The task has been completed successfully. The output values can be used as the final result.
    - `failed`: The task has failed, often due to issues on our end. Please refer to our error code first. If still unclear, please report the situation along with the task_id for support.
    - `banned`: The task has been banned due to violating our content policy.
    - `expired`: The task has expired after a certain period. Please try again and report this along with the task_id for support if it appears again.
    - `cancelled`: The task has been cancelled.
    - `unknown`: The current status of the task cannot be determined, which may indicate a system-level issue. Please contact support with the task_id.

`input`: An object containing input data, the structure of which varies depending on the task_type.

`output`: An object containing the results of the task. This may include:
  - `model`: A URL to download the model, which by default expires after five minutes.
  - `base_model`: A URL to download the base model, which by default expires after five minutes.
  - `pbr_model`: A URL to download the pbr model, which by default expires after five minutes.
  - `generated_image`: A URL for generated image, which by default expires after five minutes.
  - `rendered_image`: A URL for a preview image of the model, which by default expires after five minutes.
  - `generate_multiview_image`: The output for `generate_multiview_image` and `edit_multiview_image` tasks. It contains four fixed views in order: `front`, `left`, `back`, `right`.
    - `front_view_url`: Download URL for the front view image.
    - `left_view_url`: Download URL for the left view image.
    - `back_view_url`: Download URL for the back view image.
    - `right_view_url`: Download URL for the right view image.

`progress`: A numerical indicator of the task’s progress, ranging from 0 to 100 (inclusive).
  - When status is `queued`, the progress value will be 0.
  - When status is `running`, this value indicates the task’s progress.
  - When status is `success`, progress will be marked as 100.
  - In all other cases, progress value should not be considered meaningful.

`consumed_credit`: The number of credits consumed by this task, if the task failed, it will be 0.

`queuing_num`: The current queue position for this task. Returns `-1` when the task is not in queue.

`running_left_time`: Estimated remaining running time in seconds. Returns `-1` when the task finalized.

`create_time`: The timestamp when the task was created, providing a temporal reference.

> **Important Notes**
> - **Same API key required**: A task must be queried using the same API key that initiated it. If you query a task with a different key (even one belonging to the same user), the API will return a "task not found" error.
> - **Undocumented output fields**: The `output` field may occasionally contain additional, undocumented fields. These fields can vary and may not always be present — do not rely on them for critical application logic.


## Code Examples


`GET https://api.tripo3d.ai/v2/openapi/task/:task_id`

```bash
export TASK_ID="ef731ad6-aeb0-4950-9a2e-2298359dfaf8"
curl https://api.tripo3d.ai/v2/openapi/task/${TASK_ID} \
  -H "Authorization: Bearer ${APIKEY}"
```
```python
import requests

api_key = "tsk_***"
task_id = "ef731ad6-aeb0-4950-9a2e-2298359dfaf8"
url = f"https://api.tripo3d.ai/v2/openapi/task/{task_id}"

headers = {
    "Authorization": f"Bearer {api_key}"
}

response = requests.get(url, headers=headers)

print(response.json())
```
```js
const apiKey = "tsk_***";
const taskID = "ef731ad6-aeb0-4950-9a2e-2298359dfaf8";
const url = `https://api.tripo3d.ai/v2/openapi/task/${taskID}`;

const options = {
    headers: {
        'Authorization': 'Bearer ' + apiKey
    }
};

fetch(url, options)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status},info : ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error(error);
    });
```

```json
{
  "code": 0,
  "data": {
    "task_id": "ef731ad6-aeb0-4950-9a2e-2298359dfaf8",
    "type": "text_to_model",
    "status": "running",
    "input": {
      "prompt": "a small cat"
    },
    "output": {},
    "progress": 99,
    "consumed_credit": 60,
    "queuing_num": -1,
    "running_left_time": -1,
    "create_time": 1709048933
  }
}
```




## IMAGE TO 3D:

# Image to model (P1-20260311)

This page lists all supported parameters for `image_to_model` when `model_version` is `P1-20260311`.

**When to use `P1`**

- Choose **`P1`** when you want better low-poly topology and cleaner structured mesh output.
- If you prioritize photoreal fidelity over low-poly structure, consider `image_to_model` **`H3`**.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters

### Required parameters

`type`: This field must be set to `image_to_model`.

`file`: Specifies the image input.

- `type`: Indicates the file type. Although currently not validated, specifying the correct file type is strongly advised.
- `file_token`: The identifier you get from upload, please refer to part of Upload directly. **Mutually exclusive with `url` and `object`**.
- `url`: A direct URL to the image. Supports JPEG and PNG formats with a maximum size of 20MB. **Mutually exclusive with `file_token` and `object`**.
- `object` **(Strongly Recommended)**: The information you get from upload, please refer to [Upload in STS](/file-upload/upload-in-sts.md). **Mutually exclusive with `url` and `file_token`**.
  - `bucket`: Normally it always will be `tripo-data`.
  - `key`: The `resource_uri` from returns.

`model_version`: Should always be `P1-20260311`.

### Common parameters

`model_seed`: An `integer` value chosed randomly if not set. This is the random seed for model generation. For `model_version`>=`v2.0-20240919` or `Turbo-v1.0-20250506`, the seed controls the geometry generation process, ensuring identical models when the same seed is used.

`face_limit`: An `integer` value which limits the number of faces on the output model. The range is **48 ~ 20000**. If this option is not set, the face limit will be adaptively determined.

`texture`: A `bool` value to enable texturing, set `false` to get a base model without any textures. The default value is `true`. This will cost `10` less credits when set to `false`, this will not work for version `v1.4-20240625`.

`pbr`: A `bool` value to enable pbr, set `false` to get a model without pbr. The default value is `true`. 
> **Note**
> If this option is set to `true`, value of `texture` will be ignored and set to `true`.

### Advanced parameters

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`auto_size`: A `bool` value to automatically scale the model to real-world dimensions with the unit in meters. The default value is `false`.

> **Note**
> This can only be used in textured model.

`compress`: A `text` value to specify the compression type to apply to the texture. Set to `geometry` to apply geometry-based compression to optimize the output. By Default we use meshopt compression.

`export_uv`: A `bool` value to control whether UV unwrapping is performed during generation. The default value is `true`. 
> **Note**
> When set to `false`, generation speed is significantly improved and model size is reduced. UV unwrapping will be handled during the texturing stage.

`enable_image_autofix`: A `bool` value to determine if optimize the input image to get better generation result. It will take longer time when request. The default value is `false`.

`texture_alignment`: A `text` value to determine the prioritization of texture alignment in the 3D model. The default value is `original_image`. All available values are:
- `original_image`: Prioritizes visual fidelity to the source image. This option produces textures that closely resemble the original image but may result in minor 3D inconsistencies.
- `geometry`: Prioritizes 3D structural accuracy. This option ensures better alignment with the model’s geometry but may cause slight deviations from the original image appearance.

`orientation`: A `text` value. When set `orientation`=`align_image`, it will automatically rotate the model to align the original image. The default value is `default`. This parameter only takes effect when `texture`=`true`.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"image_to_model","file":{"type":"image","file_token":"ce85f375-3ccc-440b-b847-571588872ec2"},"model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "image_to_model",
    "file": {
        "type": "image",
        "file_token": "ce85f375-3ccc-440b-b847-571588872ec2"
    },
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'image_to_model',
  file: {
    type: 'image',
    file_token: 'ce85f375-3ccc-440b-b847-571588872ec2'
  },
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```


# Image to model (H3)

This page lists all supported parameters for `image_to_model` in the **H3** product line. H3 supports two model versions: `v3.1-20260211` and `v3.0-20250812`.

**When to use `H3`**

- Choose **`H3`** when you need high-fidelity geometry and broad parameter control.
- If you already have four directional views, use `multiview_to_model` instead of `image_to_model`.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters

### Required parameters

`type`: This field must be set to `image_to_model`.

`file`: Specifies the image input.

- `type`: Indicates the file type. Although currently not validated, specifying the correct file type is strongly advised.
- `file_token`: The identifier you get from upload, please refer to part of Upload directly. **Mutually exclusive with `url` and `object`**.
- `url`: A direct URL to the image. Supports JPEG and PNG formats with a maximum size of 20MB. **Mutually exclusive with `file_token` and `object`**.
- `object` **(Strongly Recommended)**: The information you get from upload, please refer to [Upload in STS](/file-upload/upload-in-sts.md). **Mutually exclusive with `url` and `file_token`**.
  - `bucket`: Normally it always will be `tripo-data`.
  - `key`: The `resource_uri` from returns.

`model_version`: `v3.1-20260211` or `v3.0-20250812`.

### Common parameters

`model_seed`: An `integer` value chosed randomly if not set. This is the random seed for model generation. For `model_version`>=`v2.0-20240919` or `Turbo-v1.0-20250506`, the seed controls the geometry generation process, ensuring identical models when the same seed is used.

`enable_image_autofix`: A `bool` value to determine if optimize the input image to get better generation result. It will take longer time when request. The default value is `false`.

`texture`: A `bool` value to enable texturing, set `false` to get a base model without any textures. The default value is `true`. This will cost `10` less credits when set to `false`, this will not work for version `v1.4-20240625`.

### Advanced parameters

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_alignment`: A `text` value to determine the prioritization of texture alignment in the 3D model. The default value is `original_image`. All available values are:
- `original_image`: Prioritizes visual fidelity to the source image. This option produces textures that closely resemble the original image but may result in minor 3D inconsistencies.
- `geometry`: Prioritizes 3D structural accuracy. This option ensures better alignment with the model’s geometry but may cause slight deviations from the original image appearance.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`pbr`: A `bool` value to enable pbr, set `false` to get a model without pbr. The default value is `true`. 
> **Note**
> If this option is set to `true`, value of `texture` will be ignored and set to `true`.

`smart_low_poly`: A `bool` value to control if generate low-poly meshes with hand‑crafted topology. Inputs with less complexity work best.  The default value is `false`. This will cost `10` additional credits when set to `true`.
> **Caution**
> There is a possibility of failure for complex models.

`quad`: A `bool` value, set `true` to enable quad mesh output. If `quad`=`true` and `face_limit` is not set, `face_limit` will default to **10000**. Recommended not to exceed **150,000**. This will cost `5` additional credits when set to `true`.
> **Note**
> Enabling this option will force the output to be an FBX model.

`face_limit`: An `integer` value which limits the number of faces on the output model. If this option is not set, the face limit will be adaptively determined.

**Triangle face limits** (default output):

| Model Version | Standard (`geometry_quality`=`standard`) | Ultra (`geometry_quality`=`detailed`) |
|---|---|---|
| `v3.1-20260211` | up to **1,500,000** | up to **2,000,000** |
| `v3.0-20250812` | up to **1,500,000** | up to **2,000,000** |

**Quad face limit** (`quad`=`true`): recommended not to exceed **150,000**.

If `smart_low_poly`=`true`, it should be **1000~20000**; if `quad`=`true` as well, it should be **500~10000**.

`auto_size`: A `bool` value to automatically scale the model to real-world dimensions with the unit in meters. The default value is `false`.

> **Note**
> This can only be used in textured model.

`orientation`: A `text` value. When set `orientation`=`align_image`, it will automatically rotate the model to align the original image. The default value is `default`. This parameter only takes effect when `texture`=`true`.

`compress`: A `text` value to specify the compression type to apply to the texture. Set to `geometry` to apply geometry-based compression to optimize the output. By Default we use meshopt compression.

`generate_parts`: Generate segmented 3D models and make each part editable. The default value is `false`. This will cost `20` additional credits when set to `true`.
> **Note**
> Generate_parts is not compatible with `texture`=`true` or `pbr`=`true`, if you want to generate parts, please set `texture`=`false` and `pbr`=`false`;
> 
> Generate_parts is also not compatible with `quad`=`true`, if you want to generate parts, please set `quad`=`false`.

`export_uv`: A `bool` value to control whether UV unwrapping is performed during generation. The default value is `true`. 
> **Note**
> When set to `false`, generation speed is significantly improved and model size is reduced. UV unwrapping will be handled during the texturing stage.

`geometry_quality`: A `text` value can be set in following option, this will cost `20` additional credits when set to `detailed`:
- **Ultra Mode**: Maximum detail for the most intricate and realistic models when setting to `detailed`. 
- **Standard Mode**: Balanced detail and speed. The default value is `standard`

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"image_to_model","file":{"type":"image","file_token":"ce85f375-3ccc-440b-b847-571588872ec2"},"model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "image_to_model",
    "file": {
        "type": "image",
        "file_token": "ce85f375-3ccc-440b-b847-571588872ec2"
    },
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'image_to_model',
  file: {
    type: 'image',
    file_token: 'ce85f375-3ccc-440b-b847-571588872ec2'
  },
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

# Image to model (H2)

This page lists all supported parameters for `image_to_model` in the **H2** product line. H2 supports two model versions: `v2.5-20250123` and `v2.0-20240919`. The supported parameters are the same for both; pick the `model_version` that matches your pipeline. If you omit `model_version`, the default is `v2.5-20250123` in the general generation reference.

**When to use `H2`**

- Choose **`H2`** when you need a stable and widely compatible 2.x production baseline.
- If you prioritize newer quality controls, use `image_to_model` **`H3`** instead.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters

### Required parameters

`type`: This field must be set to `image_to_model`.

`file`: Specifies the image input.

- `type`: Indicates the file type. Although currently not validated, specifying the correct file type is strongly advised.
- `file_token`: The identifier you get from upload, please refer to part of Upload directly. **Mutually exclusive with `url` and `object`**.
- `url`: A direct URL to the image. Supports JPEG and PNG formats with a maximum size of 20MB. **Mutually exclusive with `file_token` and `object`**.
- `object` **(Strongly Recommended)**: The information you get from upload, please refer to [Upload in STS](/file-upload/upload-in-sts.md). **Mutually exclusive with `url` and `file_token`**.
  - `bucket`: Normally it always will be `tripo-data`.
  - `key`: The `resource_uri` from returns.

`model_version`: Set to `v2.5-20250123` or `v2.0-20240919`.

### Common parameters

`model_seed`: An `integer` value chosed randomly if not set. This is the random seed for model generation. For `model_version`>=`v2.0-20240919` or `Turbo-v1.0-20250506`, the seed controls the geometry generation process, ensuring identical models when the same seed is used.

`enable_image_autofix`: A `bool` value to determine if optimize the input image to get better generation result. It will take longer time when request. The default value is `false`.

`texture`: A `bool` value to enable texturing, set `false` to get a base model without any textures. The default value is `true`. This will cost `10` less credits when set to `false`, this will not work for version `v1.4-20240625`.

### Advanced parameters

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_alignment`: A `text` value to determine the prioritization of texture alignment in the 3D model. The default value is `original_image`. All available values are:
- `original_image`: Prioritizes visual fidelity to the source image. This option produces textures that closely resemble the original image but may result in minor 3D inconsistencies.
- `geometry`: Prioritizes 3D structural accuracy. This option ensures better alignment with the model’s geometry but may cause slight deviations from the original image appearance.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`pbr`: A `bool` value to enable pbr, set `false` to get a model without pbr. The default value is `true`. 
> **Note**
> If this option is set to `true`, value of `texture` will be ignored and set to `true`.

`smart_low_poly`: A `bool` value to control if generate low-poly meshes with hand‑crafted topology. Inputs with less complexity work best.  The default value is `false`. This will cost `10` additional credits when set to `true`.
> **Caution**
> There is a possibility of failure for complex models.

`quad`: A `bool` value, set `true` to enable quad mesh output. If `quad`=`true` and `face_limit` is not set, `face_limit` will default to **10000**. Recommended not to exceed **150,000**. This will cost `5` additional credits when set to `true`.
> **Note**
> Enabling this option will force the output to be an FBX model.

`face_limit`: An `integer` value which limits the number of faces on the output model. If this option is not set, the face limit will be adaptively determined. The face limit is up to **500,000**.

**Quad face limit** (`quad`=`true`): recommended not to exceed **150,000**.

If `smart_low_poly`=`true`, it should be **1000~20000**; if `quad`=`true` as well, it should be **500~10000**.

`auto_size`: A `bool` value to automatically scale the model to real-world dimensions with the unit in meters. The default value is `false`.

> **Note**
> This can only be used in textured model.

`orientation`: A `text` value. When set `orientation`=`align_image`, it will automatically rotate the model to align the original image. The default value is `default`. This parameter only takes effect when `texture`=`true`.

`compress`: A `text` value to specify the compression type to apply to the texture. Set to `geometry` to apply geometry-based compression to optimize the output. By Default we use meshopt compression.

`generate_parts`: Generate segmented 3D models and make each part editable. The default value is `false`. This will cost `20` additional credits when set to `true`.
> **Note**
> Generate_parts is not compatible with `texture`=`true` or `pbr`=`true`, if you want to generate parts, please set `texture`=`false` and `pbr`=`false`;
> 
> Generate_parts is also not compatible with `quad`=`true`, if you want to generate parts, please set `quad`=`false`.

`export_uv`: A `bool` value to control whether UV unwrapping is performed during generation. The default value is `true`. 
> **Note**
> When set to `false`, generation speed is significantly improved and model size is reduced. UV unwrapping will be handled during the texturing stage.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"image_to_model","file":{"type":"image","file_token":"ce85f375-3ccc-440b-b847-571588872ec2"},"model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "image_to_model",
    "file": {
        "type": "image",
        "file_token": "ce85f375-3ccc-440b-b847-571588872ec2"
    },
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'image_to_model',
  file: {
    type: 'image',
    file_token: 'ce85f375-3ccc-440b-b847-571588872ec2'
  },
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

# Image to model (Turbo-v1.0-20250506)

This page lists all supported parameters for `image_to_model` when using `model_version` `Turbo-v1.0-20250506`.

**When to use Turbo-v1.0**

- Choose Turbo-v1.0 when latency is the top priority and you want the fastest turnaround.
- If you need higher fidelity controls, use **`H3`** or **`P1`** instead.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters

### Required parameters

`type`: This field must be set to `image_to_model`.

`file`: Specifies the image input.

- `type`: Indicates the file type. Although currently not validated, specifying the correct file type is strongly advised.
- `file_token`: The identifier you get from upload, please refer to part of Upload directly. **Mutually exclusive with `url` and `object`**.
- `url`: A direct URL to the image. Supports JPEG and PNG formats with a maximum size of 20MB. **Mutually exclusive with `file_token` and `object`**.
- `object` **(Strongly Recommended)**: The information you get from upload, please refer to [Upload in STS](/file-upload/upload-in-sts.md). **Mutually exclusive with `url` and `file_token`**.
  - `bucket`: Normally it always will be `tripo-data`.
  - `key`: The `resource_uri` from returns.

`model_version`: Set to `Turbo-v1.0-20250506`.

### Common parameters

`model_seed`: An `integer` value chosed randomly if not set. This is the random seed for model generation. For `model_version`>=`v2.0-20240919` or `Turbo-v1.0-20250506`, the seed controls the geometry generation process, ensuring identical models when the same seed is used.

`enable_image_autofix`: A `bool` value to determine if optimize the input image to get better generation result. It will take longer time when request. The default value is `false`.

`texture`: A `bool` value to enable texturing, set `false` to get a base model without any textures. The default value is `true`. This will cost `10` less credits when set to `false`, this will not work for version `v1.4-20240625`.

### Advanced parameters

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`pbr`: A `bool` value to enable pbr, set `false` to get a model without pbr. The default value is `true`. 
> **Note**
> If this option is set to `true`, value of `texture` will be ignored and set to `true`.

`quad`: A `bool` value, set `true` to enable quad mesh output. If `quad`=`true` and `face_limit` is not set, `face_limit` will default to **10000**. Recommended not to exceed **150,000**. This will cost `5` additional credits when set to `true`.
> **Note**
> Enabling this option will force the output to be an FBX model.

`face_limit`: An `integer` value which limits the number of faces on the output model. If this option is not set, the face limit will be adaptively determined. The face limit is up to **50,000**.

**Quad face limit** (`quad`=`true`): recommended not to exceed **50,000**.

`auto_size`: A `bool` value to automatically scale the model to real-world dimensions with the unit in meters. The default value is `false`.

> **Note**
> This can only be used in textured model.

`orientation`: A `text` value. When set `orientation`=`align_image`, it will automatically rotate the model to align the original image. The default value is `default`. This parameter only takes effect when `texture`=`true`.

`compress`: A `text` value to specify the compression type to apply to the texture. Set to `geometry` to apply geometry-based compression to optimize the output. By Default we use meshopt compression.

`generate_parts`: Generate segmented 3D models and make each part editable. The default value is `false`. This will cost `20` additional credits when set to `true`.
> **Note**
> Generate_parts is not compatible with `texture`=`true` or `pbr`=`true`, if you want to generate parts, please set `texture`=`false` and `pbr`=`false`;
> 
> Generate_parts is also not compatible with `quad`=`true`, if you want to generate parts, please set `quad`=`false`.

`export_uv`: A `bool` value to control whether UV unwrapping is performed during generation. The default value is `true`. 
> **Note**
> When set to `false`, generation speed is significantly improved and model size is reduced. UV unwrapping will be handled during the texturing stage.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"image_to_model","file":{"type":"image","file_token":"ce85f375-3ccc-440b-b847-571588872ec2"},"model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "image_to_model",
    "file": {
        "type": "image",
        "file_token": "ce85f375-3ccc-440b-b847-571588872ec2"
    },
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'image_to_model',
  file: {
    type: 'image',
    file_token: 'ce85f375-3ccc-440b-b847-571588872ec2'
  },
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

## TEXT TO 3D MODEL:

# Text to model (P1-20260311)

This page lists all supported parameters for `text_to_model` when `model_version` is `P1-20260311`.

**When to use `P1`**

- Choose **`P1`** when prompt-only generation needs stronger low-poly topology quality.
- If you need richer fidelity controls, consider `text_to_model` **`H3`**.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters

### Required parameters

`type`: This field must be set to `text_to_model`.

`prompt`: A `text` value that directs the model generation.
The maximum prompt length is 1024 characters, equivalent to approximately 100 words.
The API supports multiple languages. However, emojis and certain special Unicode characters are not supported.

`model_version`: Should always be `P1-20260311`.

### Common parameters

`negative_prompt`: A `text` value which provides a reverse direction to assist in generating content contrasting with the original prompt. The maximum length is 255 characters.

`image_seed`: An `integer` value chosed randomly if not set. This is the random seed for image generation.

`model_seed`: An `integer` value chosed randomly if not set. This is the random seed for model generation. For `model_version`>=`v2.0-20240919` or `Turbo-v1.0-20250506`, the seed controls the geometry generation process, ensuring identical models when the same seed is used.

`face_limit`: An `integer` value which limits the number of faces on the output model. The range is **48 ~ 20000**. If this option is not set, the face limit will be adaptively determined.

`texture`: A `bool` value to enable texturing, set `false` to get a base model without any textures. The default value is `true`. This will cost `10` less credits when set to `false`, this will not work for version `v1.4-20240625`.

`pbr`: A `bool` value to enable pbr, set `false` to get a model without pbr. The default value is `true`. 
> **Note**
> If this option is set to `true`, value of `texture` will be ignored and set to `true`.

### Advanced parameters

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`auto_size`: A `bool` value to automatically scale the model to real-world dimensions with the unit in meters. The default value is `false`.

> **Note**
> This can only be used in textured model.

`compress`: A `text` value to specify the compression type to apply to the texture. Set to `geometry` to apply geometry-based compression to optimize the output. By Default we use meshopt compression.

`export_uv`: A `bool` value to control whether UV unwrapping is performed during generation. The default value is `true`. 
> **Note**
> When set to `false`, generation speed is significantly improved and model size is reduced. UV unwrapping will be handled during the texturing stage.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"text_to_model","prompt":"a stylized wooden chair","model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "text_to_model",
    "prompt": "a stylized wooden chair",
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'text_to_model',
  prompt: 'a stylized wooden chair',
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

# Text to model (H3)

This page lists all supported parameters for `text_to_model` in the **H3** product line. H3 supports two model versions: `v3.1-20260211` and `v3.0-20250812`.

**When to use `H3`**

- Choose **`H3`** when you need better prompt fidelity and full advanced controls.
- If you already have an input image, use `image_to_model` instead of `text_to_model`.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters

### Required parameters

`type`: This field must be set to `text_to_model`.

`prompt`: A `text` value that directs the model generation.
The maximum prompt length is 1024 characters, equivalent to approximately 100 words.
The API supports multiple languages. However, emojis and certain special Unicode characters are not supported.

`model_version`: `v3.1-20260211` or `v3.0-20250812`.

### Common parameters

`negative_prompt`: A `text` value which provides a reverse direction to assist in generating content contrasting with the original prompt. The maximum length is 255 characters.

`image_seed`: An `integer` value chosed randomly if not set. This is the random seed for image generation.

`model_seed`: An `integer` value chosed randomly if not set. This is the random seed for model generation. For `model_version`>=`v2.0-20240919` or `Turbo-v1.0-20250506`, the seed controls the geometry generation process, ensuring identical models when the same seed is used.

`texture`: A `bool` value to enable texturing, set `false` to get a base model without any textures. The default value is `true`. This will cost `10` less credits when set to `false`, this will not work for version `v1.4-20240625`.

### Advanced parameters

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`pbr`: A `bool` value to enable pbr, set `false` to get a model without pbr. The default value is `true`. 
> **Note**
> If this option is set to `true`, value of `texture` will be ignored and set to `true`.

`smart_low_poly`: A `bool` value to control if generate low-poly meshes with hand‑crafted topology. Inputs with less complexity work best.  The default value is `false`. This will cost `10` additional credits when set to `true`.
> **Caution**
> There is a possibility of failure for complex models.

`quad`: A `bool` value, set `true` to enable quad mesh output. If `quad`=`true` and `face_limit` is not set, `face_limit` will default to **10000**. Recommended not to exceed **150,000**. This will cost `5` additional credits when set to `true`.
> **Note**
> Enabling this option will force the output to be an FBX model.

`face_limit`: An `integer` value which limits the number of faces on the output model. If this option is not set, the face limit will be adaptively determined.

**Triangle face limits** (default output):

| Model Version | Standard (`geometry_quality`=`standard`) | Ultra (`geometry_quality`=`detailed`) |
|---|---|---|
| `v3.1-20260211` | up to **1,500,000** | up to **2,000,000** |
| `v3.0-20250812` | up to **1,500,000** | up to **2,000,000** |

**Quad face limit** (`quad`=`true`): recommended not to exceed **150,000**.

If `smart_low_poly`=`true`, it should be **1000~20000**; if `quad`=`true` as well, it should be **500~10000**.

`auto_size`: A `bool` value to automatically scale the model to real-world dimensions with the unit in meters. The default value is `false`.

> **Note**
> This can only be used in textured model.

`compress`: A `text` value to specify the compression type to apply to the texture. Set to `geometry` to apply geometry-based compression to optimize the output. By Default we use meshopt compression.

`generate_parts`: Generate segmented 3D models and make each part editable. The default value is `false`. This will cost `20` additional credits when set to `true`.
> **Note**
> Generate_parts is not compatible with `texture`=`true` or `pbr`=`true`, if you want to generate parts, please set `texture`=`false` and `pbr`=`false`;
> 
> Generate_parts is also not compatible with `quad`=`true`, if you want to generate parts, please set `quad`=`false`.

`export_uv`: A `bool` value to control whether UV unwrapping is performed during generation. The default value is `true`. 
> **Note**
> When set to `false`, generation speed is significantly improved and model size is reduced. UV unwrapping will be handled during the texturing stage.

`geometry_quality`: A `text` value can be set in following option, this will cost `20` additional credits when set to `detailed`:
- **Ultra Mode**: Maximum detail for the most intricate and realistic models when setting to `detailed`. 
- **Standard Mode**: Balanced detail and speed. The default value is `standard`

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"text_to_model","prompt":"a stylized wooden chair","model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "text_to_model",
    "prompt": "a stylized wooden chair",
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'text_to_model',
  prompt: 'a stylized wooden chair',
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

# Text to model (H3)

This page lists all supported parameters for `text_to_model` in the **H3** product line. H3 supports two model versions: `v3.1-20260211` and `v3.0-20250812`.

**When to use `H3`**

- Choose **`H3`** when you need better prompt fidelity and full advanced controls.
- If you already have an input image, use `image_to_model` instead of `text_to_model`.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters

### Required parameters

`type`: This field must be set to `text_to_model`.

`prompt`: A `text` value that directs the model generation.
The maximum prompt length is 1024 characters, equivalent to approximately 100 words.
The API supports multiple languages. However, emojis and certain special Unicode characters are not supported.

`model_version`: `v3.1-20260211` or `v3.0-20250812`.

### Common parameters

`negative_prompt`: A `text` value which provides a reverse direction to assist in generating content contrasting with the original prompt. The maximum length is 255 characters.

`image_seed`: An `integer` value chosed randomly if not set. This is the random seed for image generation.

`model_seed`: An `integer` value chosed randomly if not set. This is the random seed for model generation. For `model_version`>=`v2.0-20240919` or `Turbo-v1.0-20250506`, the seed controls the geometry generation process, ensuring identical models when the same seed is used.

`texture`: A `bool` value to enable texturing, set `false` to get a base model without any textures. The default value is `true`. This will cost `10` less credits when set to `false`, this will not work for version `v1.4-20240625`.

### Advanced parameters

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`pbr`: A `bool` value to enable pbr, set `false` to get a model without pbr. The default value is `true`. 
> **Note**
> If this option is set to `true`, value of `texture` will be ignored and set to `true`.

`smart_low_poly`: A `bool` value to control if generate low-poly meshes with hand‑crafted topology. Inputs with less complexity work best.  The default value is `false`. This will cost `10` additional credits when set to `true`.
> **Caution**
> There is a possibility of failure for complex models.

`quad`: A `bool` value, set `true` to enable quad mesh output. If `quad`=`true` and `face_limit` is not set, `face_limit` will default to **10000**. Recommended not to exceed **150,000**. This will cost `5` additional credits when set to `true`.
> **Note**
> Enabling this option will force the output to be an FBX model.

`face_limit`: An `integer` value which limits the number of faces on the output model. If this option is not set, the face limit will be adaptively determined.

**Triangle face limits** (default output):

| Model Version | Standard (`geometry_quality`=`standard`) | Ultra (`geometry_quality`=`detailed`) |
|---|---|---|
| `v3.1-20260211` | up to **1,500,000** | up to **2,000,000** |
| `v3.0-20250812` | up to **1,500,000** | up to **2,000,000** |

**Quad face limit** (`quad`=`true`): recommended not to exceed **150,000**.

If `smart_low_poly`=`true`, it should be **1000~20000**; if `quad`=`true` as well, it should be **500~10000**.

`auto_size`: A `bool` value to automatically scale the model to real-world dimensions with the unit in meters. The default value is `false`.

> **Note**
> This can only be used in textured model.

`compress`: A `text` value to specify the compression type to apply to the texture. Set to `geometry` to apply geometry-based compression to optimize the output. By Default we use meshopt compression.

`generate_parts`: Generate segmented 3D models and make each part editable. The default value is `false`. This will cost `20` additional credits when set to `true`.
> **Note**
> Generate_parts is not compatible with `texture`=`true` or `pbr`=`true`, if you want to generate parts, please set `texture`=`false` and `pbr`=`false`;
> 
> Generate_parts is also not compatible with `quad`=`true`, if you want to generate parts, please set `quad`=`false`.

`export_uv`: A `bool` value to control whether UV unwrapping is performed during generation. The default value is `true`. 
> **Note**
> When set to `false`, generation speed is significantly improved and model size is reduced. UV unwrapping will be handled during the texturing stage.

`geometry_quality`: A `text` value can be set in following option, this will cost `20` additional credits when set to `detailed`:
- **Ultra Mode**: Maximum detail for the most intricate and realistic models when setting to `detailed`. 
- **Standard Mode**: Balanced detail and speed. The default value is `standard`

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"text_to_model","prompt":"a stylized wooden chair","model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "text_to_model",
    "prompt": "a stylized wooden chair",
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'text_to_model',
  prompt: 'a stylized wooden chair',
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

# Text to model (H2)

This page lists all supported parameters for `text_to_model` in the **H2** product line. H2 supports two model versions: `v2.5-20250123` and `v2.0-20240919`. The supported parameters are the same for both. If you omit `model_version`, the default in the general generation reference is `v2.5-20250123`.

**When to use `H2`**

- Choose **`H2`** when you need stable prompt-to-3D behavior with consistent 2.x parameters.
- If you need newer quality controls, use `text_to_model` **`H3`** instead.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters

### Required parameters

`type`: This field must be set to `text_to_model`.

`prompt`: A `text` value that directs the model generation.
The maximum prompt length is 1024 characters, equivalent to approximately 100 words.
The API supports multiple languages. However, emojis and certain special Unicode characters are not supported.

`model_version`: Set to `v2.5-20250123` or `v2.0-20240919`.

### Common parameters

`negative_prompt`: A `text` value which provides a reverse direction to assist in generating content contrasting with the original prompt. The maximum length is 255 characters.

`image_seed`: An `integer` value chosed randomly if not set. This is the random seed for image generation.

`model_seed`: An `integer` value chosed randomly if not set. This is the random seed for model generation. For `model_version`>=`v2.0-20240919` or `Turbo-v1.0-20250506`, the seed controls the geometry generation process, ensuring identical models when the same seed is used.

`texture`: A `bool` value to enable texturing, set `false` to get a base model without any textures. The default value is `true`. This will cost `10` less credits when set to `false`, this will not work for version `v1.4-20240625`.

### Advanced parameters

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`pbr`: A `bool` value to enable pbr, set `false` to get a model without pbr. The default value is `true`. 
> **Note**
> If this option is set to `true`, value of `texture` will be ignored and set to `true`.

`smart_low_poly`: A `bool` value to control if generate low-poly meshes with hand‑crafted topology. Inputs with less complexity work best.  The default value is `false`. This will cost `10` additional credits when set to `true`.
> **Caution**
> There is a possibility of failure for complex models.

`quad`: A `bool` value, set `true` to enable quad mesh output. If `quad`=`true` and `face_limit` is not set, `face_limit` will default to **10000**. Recommended not to exceed **150,000**. This will cost `5` additional credits when set to `true`.
> **Note**
> Enabling this option will force the output to be an FBX model.

`face_limit`: An `integer` value which limits the number of faces on the output model. If this option is not set, the face limit will be adaptively determined. The face limit is up to **500,000**.

**Quad face limit** (`quad`=`true`): recommended not to exceed **150,000**.

If `smart_low_poly`=`true`, it should be **1000~20000**; if `quad`=`true` as well, it should be **500~10000**.

`auto_size`: A `bool` value to automatically scale the model to real-world dimensions with the unit in meters. The default value is `false`.

> **Note**
> This can only be used in textured model.

`compress`: A `text` value to specify the compression type to apply to the texture. Set to `geometry` to apply geometry-based compression to optimize the output. By Default we use meshopt compression.

`generate_parts`: Generate segmented 3D models and make each part editable. The default value is `false`. This will cost `20` additional credits when set to `true`.
> **Note**
> Generate_parts is not compatible with `texture`=`true` or `pbr`=`true`, if you want to generate parts, please set `texture`=`false` and `pbr`=`false`;
> 
> Generate_parts is also not compatible with `quad`=`true`, if you want to generate parts, please set `quad`=`false`.

`export_uv`: A `bool` value to control whether UV unwrapping is performed during generation. The default value is `true`. 
> **Note**
> When set to `false`, generation speed is significantly improved and model size is reduced. UV unwrapping will be handled during the texturing stage.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"text_to_model","prompt":"a stylized wooden chair","model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "text_to_model",
    "prompt": "a stylized wooden chair",
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'text_to_model',
  prompt: 'a stylized wooden chair',
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```


# Text to model (Turbo-v1.0-20250506)

This page lists all supported parameters for `text_to_model` when using `model_version` `Turbo-v1.0-20250506`.

**When to use Turbo-v1.0**

- Choose Turbo-v1.0 when you need the fastest prompt-to-3D response.
- If you need stronger quality tuning, use **`H3`** or **`P1`** instead.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters

### Required parameters

`type`: This field must be set to `text_to_model`.

`prompt`: A `text` value that directs the model generation.
The maximum prompt length is 1024 characters, equivalent to approximately 100 words.
The API supports multiple languages. However, emojis and certain special Unicode characters are not supported.

`model_version`: Set to `Turbo-v1.0-20250506`.

### Common parameters

`negative_prompt`: A `text` value which provides a reverse direction to assist in generating content contrasting with the original prompt. The maximum length is 255 characters.

`image_seed`: An `integer` value chosed randomly if not set. This is the random seed for image generation.

`model_seed`: An `integer` value chosed randomly if not set. This is the random seed for model generation. For `model_version`>=`v2.0-20240919` or `Turbo-v1.0-20250506`, the seed controls the geometry generation process, ensuring identical models when the same seed is used.

`texture`: A `bool` value to enable texturing, set `false` to get a base model without any textures. The default value is `true`. This will cost `10` less credits when set to `false`, this will not work for version `v1.4-20240625`.

### Advanced parameters

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`pbr`: A `bool` value to enable pbr, set `false` to get a model without pbr. The default value is `true`. 
> **Note**
> If this option is set to `true`, value of `texture` will be ignored and set to `true`.

`quad`: A `bool` value, set `true` to enable quad mesh output. If `quad`=`true` and `face_limit` is not set, `face_limit` will default to **10000**. Recommended not to exceed **150,000**. This will cost `5` additional credits when set to `true`.
> **Note**
> Enabling this option will force the output to be an FBX model.

`face_limit`: An `integer` value which limits the number of faces on the output model. If this option is not set, the face limit will be adaptively determined. The face limit is up to **50,000**.

**Quad face limit** (`quad`=`true`): recommended not to exceed **50,000**.

`auto_size`: A `bool` value to automatically scale the model to real-world dimensions with the unit in meters. The default value is `false`.

> **Note**
> This can only be used in textured model.

`compress`: A `text` value to specify the compression type to apply to the texture. Set to `geometry` to apply geometry-based compression to optimize the output. By Default we use meshopt compression.

`generate_parts`: Generate segmented 3D models and make each part editable. The default value is `false`. This will cost `20` additional credits when set to `true`.
> **Note**
> Generate_parts is not compatible with `texture`=`true` or `pbr`=`true`, if you want to generate parts, please set `texture`=`false` and `pbr`=`false`;
> 
> Generate_parts is also not compatible with `quad`=`true`, if you want to generate parts, please set `quad`=`false`.

`export_uv`: A `bool` value to control whether UV unwrapping is performed during generation. The default value is `true`. 
> **Note**
> When set to `false`, generation speed is significantly improved and model size is reduced. UV unwrapping will be handled during the texturing stage.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"text_to_model","prompt":"a stylized wooden chair","model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "text_to_model",
    "prompt": "a stylized wooden chair",
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'text_to_model',
  prompt: 'a stylized wooden chair',
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

## MULTI IMAGE TO 3D MODEL:


# Multiview to model (P1-20260311)

This page lists all supported parameters for `multiview_to_model` when `model_version` is `P1-20260311`.

**When to use `P1`**

- Choose **`P1`** when multiview input needs cleaner low-poly output with stable topology.
- If you need richer high-fidelity details, consider `multiview_to_model` **`H3`**.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters

### Required parameters

`type`: This field must be set to `multiview_to_model`.

`files`: Specifies the image inputs, this is a list of `file`. The list must contain exactly `4` items in the order [front, left, back, right]. You may omit certain input files by omitting the file_token, but the front input cannot be omitted. **Do not use less than two images to generate.** Mutually exclusive with `original_task_id`.
> **File object**
> `file`: Specifies the image input.
> 
> - `type`: Indicates the file type. Although currently not validated, specifying the correct file type is strongly advised.
> - `file_token`: The identifier you get from upload, please refer to part of Upload directly. **Mutually exclusive with `url` and `object`**.
> - `url`: A direct URL to the image. Supports JPEG and PNG formats with a maximum size of 20MB. **Mutually exclusive with `file_token` and `object`**.
> - `object` **(Strongly Recommended)**: The information you get from upload, please refer to [Upload in STS](/file-upload/upload-in-sts.md). **Mutually exclusive with `url` and `file_token`**.
> - `bucket`: Normally it always will be `tripo-data`.
> - `key`: The `resource_uri` from returns.

`original_task_id`: The `task_id` from a previous `generate_multiview_image` or `edit_multiview_image` task. Mutually exclusive with `files`.

`model_version`: Should always be `P1-20260311`.

### Common parameters

`model_seed`: An `integer` value chosed randomly if not set. This is the random seed for model generation. For `model_version`>=`v2.0-20240919` or `Turbo-v1.0-20250506`, the seed controls the geometry generation process, ensuring identical models when the same seed is used.

`face_limit`: An `integer` value which limits the number of faces on the output model. The range is **48 ~ 20000**. If this option is not set, the face limit will be adaptively determined.

`texture`: A `bool` value to enable texturing, set `false` to get a base model without any textures. The default value is `true`. This will cost `10` less credits when set to `false`, this will not work for version `v1.4-20240625`.

`pbr`: A `bool` value to enable pbr, set `false` to get a model without pbr. The default value is `true`. 
> **Note**
> If this option is set to `true`, value of `texture` will be ignored and set to `true`.

### Advanced parameters

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`auto_size`: A `bool` value to automatically scale the model to real-world dimensions with the unit in meters. The default value is `false`.

> **Note**
> This can only be used in textured model.

`compress`: A `text` value to specify the compression type to apply to the texture. Set to `geometry` to apply geometry-based compression to optimize the output. By Default we use meshopt compression.

`export_uv`: A `bool` value to control whether UV unwrapping is performed during generation. The default value is `true`. 
> **Note**
> When set to `false`, generation speed is significantly improved and model size is reduced. UV unwrapping will be handled during the texturing stage.

`texture_alignment`: A `text` value to determine the prioritization of texture alignment in the 3D model. The default value is `original_image`. All available values are:
- `original_image`: Prioritizes visual fidelity to the source image. This option produces textures that closely resemble the original image but may result in minor 3D inconsistencies.
- `geometry`: Prioritizes 3D structural accuracy. This option ensures better alignment with the model’s geometry but may cause slight deviations from the original image appearance.

`orientation`: A `text` value. When set `orientation`=`align_image`, it will automatically rotate the model to align the original image. The default value is `default`. This parameter only takes effect when `texture`=`true`.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"multiview_to_model","files":[{"type":"image","file_token":"11111111-1111-4111-8111-111111111111"},{"type":"image","file_token":"22222222-2222-4222-8222-222222222222"},{"type":"image","file_token":"33333333-3333-4333-8333-333333333333"},{"type":"image","file_token":"44444444-4444-4444-8444-444444444444"}],"model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "multiview_to_model",
    "files": [
        {"type": "image", "file_token": "11111111-1111-4111-8111-111111111111"},
        {"type": "image", "file_token": "22222222-2222-4222-8222-222222222222"},
        {"type": "image", "file_token": "33333333-3333-4333-8333-333333333333"},
        {"type": "image", "file_token": "44444444-4444-4444-8444-444444444444"}
    ],
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'multiview_to_model',
  files: [
    { type: 'image', file_token: '11111111-1111-4111-8111-111111111111' },
    { type: 'image', file_token: '22222222-2222-4222-8222-222222222222' },
    { type: 'image', file_token: '33333333-3333-4333-8333-333333333333' },
    { type: 'image', file_token: '44444444-4444-4444-8444-444444444444' }
  ],
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

# Multiview to model (H3)

This page lists all supported parameters for `multiview_to_model` in the **H3** product line. H3 supports two model versions: `v3.1-20260211` and `v3.0-20250812`.

**When to use `H3`**

- Choose **`H3`** when you have multi-angle inputs and need better geometry consistency.
- If you only have one image, use `image_to_model` instead of `multiview_to_model`.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters

### Required parameters

`type`: This field must be set to `multiview_to_model`.

`files`: Specifies the image inputs, this is a list of `file`. The list must contain exactly `4` items in the order [front, left, back, right]. You may omit certain input files by omitting the file_token, but the front input cannot be omitted. **Do not use less than two images to generate.** Mutually exclusive with `original_task_id`.
> **File object**
> `file`: Specifies the image input.
> 
> - `type`: Indicates the file type. Although currently not validated, specifying the correct file type is strongly advised.
> - `file_token`: The identifier you get from upload, please refer to part of Upload directly. **Mutually exclusive with `url` and `object`**.
> - `url`: A direct URL to the image. Supports JPEG and PNG formats with a maximum size of 20MB. **Mutually exclusive with `file_token` and `object`**.
> - `object` **(Strongly Recommended)**: The information you get from upload, please refer to [Upload in STS](/file-upload/upload-in-sts.md). **Mutually exclusive with `url` and `file_token`**.
> - `bucket`: Normally it always will be `tripo-data`.
> - `key`: The `resource_uri` from returns.

`original_task_id`: The `task_id` from a previous `generate_multiview_image` or `edit_multiview_image` task. Mutually exclusive with `files`.

`model_version`: `v3.1-20260211` or `v3.0-20250812`.

### Common parameters

`model_seed`: An `integer` value chosed randomly if not set. This is the random seed for model generation. For `model_version`>=`v2.0-20240919` or `Turbo-v1.0-20250506`, the seed controls the geometry generation process, ensuring identical models when the same seed is used.

`enable_image_autofix`: A `bool` value to determine if optimize the input image to get better generation result. It will take longer time when request. The default value is `false`.

`texture`: A `bool` value to enable texturing, set `false` to get a base model without any textures. The default value is `true`. This will cost `10` less credits when set to `false`, this will not work for version `v1.4-20240625`.

### Advanced parameters

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_alignment`: A `text` value to determine the prioritization of texture alignment in the 3D model. The default value is `original_image`. All available values are:
- `original_image`: Prioritizes visual fidelity to the source image. This option produces textures that closely resemble the original image but may result in minor 3D inconsistencies.
- `geometry`: Prioritizes 3D structural accuracy. This option ensures better alignment with the model’s geometry but may cause slight deviations from the original image appearance.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`pbr`: A `bool` value to enable pbr, set `false` to get a model without pbr. The default value is `true`. 
> **Note**
> If this option is set to `true`, value of `texture` will be ignored and set to `true`.

`smart_low_poly`: A `bool` value to control if generate low-poly meshes with hand‑crafted topology. Inputs with less complexity work best.  The default value is `false`. This will cost `10` additional credits when set to `true`.
> **Caution**
> There is a possibility of failure for complex models.

`quad`: A `bool` value, set `true` to enable quad mesh output. If `quad`=`true` and `face_limit` is not set, `face_limit` will default to **10000**. Recommended not to exceed **150,000**. This will cost `5` additional credits when set to `true`.
> **Note**
> Enabling this option will force the output to be an FBX model.

`face_limit`: An `integer` value which limits the number of faces on the output model. If this option is not set, the face limit will be adaptively determined.

**Triangle face limits** (default output):

| Model Version | Standard (`geometry_quality`=`standard`) | Ultra (`geometry_quality`=`detailed`) |
|---|---|---|
| `v3.1-20260211` | up to **1,500,000** | up to **2,000,000** |
| `v3.0-20250812` | up to **1,500,000** | up to **2,000,000** |

**Quad face limit** (`quad`=`true`): recommended not to exceed **150,000**.

If `smart_low_poly`=`true`, it should be **1000~20000**; if `quad`=`true` as well, it should be **500~10000**.

`auto_size`: A `bool` value to automatically scale the model to real-world dimensions with the unit in meters. The default value is `false`.

> **Note**
> This can only be used in textured model.

`orientation`: A `text` value. When set `orientation`=`align_image`, it will automatically rotate the model to align the original image. The default value is `default`. This parameter only takes effect when `texture`=`true`.

`compress`: A `text` value to specify the compression type to apply to the texture. Set to `geometry` to apply geometry-based compression to optimize the output. By Default we use meshopt compression.

`generate_parts`: Generate segmented 3D models and make each part editable. The default value is `false`. This will cost `20` additional credits when set to `true`.
> **Note**
> Generate_parts is not compatible with `texture`=`true` or `pbr`=`true`, if you want to generate parts, please set `texture`=`false` and `pbr`=`false`;
> 
> Generate_parts is also not compatible with `quad`=`true`, if you want to generate parts, please set `quad`=`false`.

`export_uv`: A `bool` value to control whether UV unwrapping is performed during generation. The default value is `true`. 
> **Note**
> When set to `false`, generation speed is significantly improved and model size is reduced. UV unwrapping will be handled during the texturing stage.

`geometry_quality`: A `text` value can be set in following option, this will cost `20` additional credits when set to `detailed`:
- **Ultra Mode**: Maximum detail for the most intricate and realistic models when setting to `detailed`. 
- **Standard Mode**: Balanced detail and speed. The default value is `standard`

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"multiview_to_model","files":[{"type":"image","file_token":"11111111-1111-4111-8111-111111111111"},{"type":"image","file_token":"22222222-2222-4222-8222-222222222222"},{"type":"image","file_token":"33333333-3333-4333-8333-333333333333"},{"type":"image","file_token":"44444444-4444-4444-8444-444444444444"}],"model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "multiview_to_model",
    "files": [
        {"type": "image", "file_token": "11111111-1111-4111-8111-111111111111"},
        {"type": "image", "file_token": "22222222-2222-4222-8222-222222222222"},
        {"type": "image", "file_token": "33333333-3333-4333-8333-333333333333"},
        {"type": "image", "file_token": "44444444-4444-4444-8444-444444444444"}
    ],
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'multiview_to_model',
  files: [
    { type: 'image', file_token: '11111111-1111-4111-8111-111111111111' },
    { type: 'image', file_token: '22222222-2222-4222-8222-222222222222' },
    { type: 'image', file_token: '33333333-3333-4333-8333-333333333333' },
    { type: 'image', file_token: '44444444-4444-4444-8444-444444444444' }
  ],
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

# Multiview to model (H2)

This page lists all supported parameters for `multiview_to_model` in the **H2** product line. H2 supports two model versions: `v2.5-20250123` and `v2.0-20240919`. The supported parameters are the same for both. If you omit `model_version`, the default in the general generation reference is `v2.5-20250123`.

**When to use `H2`**

- Choose **`H2`** when you need a stable 2.x multiview workflow with predictable behavior.
- If you need stronger geometry consistency and newer controls, use `multiview_to_model` **`H3`**.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters

### Required parameters

`type`: This field must be set to `multiview_to_model`.

`files`: Specifies the image inputs, this is a list of `file`. The list must contain exactly `4` items in the order [front, left, back, right]. You may omit certain input files by omitting the file_token, but the front input cannot be omitted. **Do not use less than two images to generate.** Mutually exclusive with `original_task_id`.
> **File object**
> `file`: Specifies the image input.
> 
> - `type`: Indicates the file type. Although currently not validated, specifying the correct file type is strongly advised.
> - `file_token`: The identifier you get from upload, please refer to part of Upload directly. **Mutually exclusive with `url` and `object`**.
> - `url`: A direct URL to the image. Supports JPEG and PNG formats with a maximum size of 20MB. **Mutually exclusive with `file_token` and `object`**.
> - `object` **(Strongly Recommended)**: The information you get from upload, please refer to [Upload in STS](/file-upload/upload-in-sts.md). **Mutually exclusive with `url` and `file_token`**.
> - `bucket`: Normally it always will be `tripo-data`.
> - `key`: The `resource_uri` from returns.

`original_task_id`: The `task_id` from a previous `generate_multiview_image` or `edit_multiview_image` task. Mutually exclusive with `files`.

`model_version`: Set to `v2.5-20250123` or `v2.0-20240919`.

### Common parameters

`model_seed`: An `integer` value chosed randomly if not set. This is the random seed for model generation. For `model_version`>=`v2.0-20240919` or `Turbo-v1.0-20250506`, the seed controls the geometry generation process, ensuring identical models when the same seed is used.

`enable_image_autofix`: A `bool` value to determine if optimize the input image to get better generation result. It will take longer time when request. The default value is `false`.

`texture`: A `bool` value to enable texturing, set `false` to get a base model without any textures. The default value is `true`. This will cost `10` less credits when set to `false`, this will not work for version `v1.4-20240625`.

### Advanced parameters

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_alignment`: A `text` value to determine the prioritization of texture alignment in the 3D model. The default value is `original_image`. All available values are:
- `original_image`: Prioritizes visual fidelity to the source image. This option produces textures that closely resemble the original image but may result in minor 3D inconsistencies.
- `geometry`: Prioritizes 3D structural accuracy. This option ensures better alignment with the model’s geometry but may cause slight deviations from the original image appearance.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`pbr`: A `bool` value to enable pbr, set `false` to get a model without pbr. The default value is `true`. 
> **Note**
> If this option is set to `true`, value of `texture` will be ignored and set to `true`.

`smart_low_poly`: A `bool` value to control if generate low-poly meshes with hand‑crafted topology. Inputs with less complexity work best.  The default value is `false`. This will cost `10` additional credits when set to `true`.
> **Caution**
> There is a possibility of failure for complex models.

`quad`: A `bool` value, set `true` to enable quad mesh output. If `quad`=`true` and `face_limit` is not set, `face_limit` will default to **10000**. Recommended not to exceed **150,000**. This will cost `5` additional credits when set to `true`.
> **Note**
> Enabling this option will force the output to be an FBX model.

`face_limit`: An `integer` value which limits the number of faces on the output model. If this option is not set, the face limit will be adaptively determined. The face limit is up to **500,000**.

**Quad face limit** (`quad`=`true`): recommended not to exceed **150,000**.

If `smart_low_poly`=`true`, it should be **1000~20000**; if `quad`=`true` as well, it should be **500~10000**.

`auto_size`: A `bool` value to automatically scale the model to real-world dimensions with the unit in meters. The default value is `false`.

> **Note**
> This can only be used in textured model.

`orientation`: A `text` value. When set `orientation`=`align_image`, it will automatically rotate the model to align the original image. The default value is `default`. This parameter only takes effect when `texture`=`true`.

`compress`: A `text` value to specify the compression type to apply to the texture. Set to `geometry` to apply geometry-based compression to optimize the output. By Default we use meshopt compression.

`generate_parts`: Generate segmented 3D models and make each part editable. The default value is `false`. This will cost `20` additional credits when set to `true`.
> **Note**
> Generate_parts is not compatible with `texture`=`true` or `pbr`=`true`, if you want to generate parts, please set `texture`=`false` and `pbr`=`false`;
> 
> Generate_parts is also not compatible with `quad`=`true`, if you want to generate parts, please set `quad`=`false`.

`export_uv`: A `bool` value to control whether UV unwrapping is performed during generation. The default value is `true`. 
> **Note**
> When set to `false`, generation speed is significantly improved and model size is reduced. UV unwrapping will be handled during the texturing stage.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"multiview_to_model","files":[{"type":"image","file_token":"11111111-1111-4111-8111-111111111111"},{"type":"image","file_token":"22222222-2222-4222-8222-222222222222"},{"type":"image","file_token":"33333333-3333-4333-8333-333333333333"},{"type":"image","file_token":"44444444-4444-4444-8444-444444444444"}],"model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "multiview_to_model",
    "files": [
        {"type": "image", "file_token": "11111111-1111-4111-8111-111111111111"},
        {"type": "image", "file_token": "22222222-2222-4222-8222-222222222222"},
        {"type": "image", "file_token": "33333333-3333-4333-8333-333333333333"},
        {"type": "image", "file_token": "44444444-4444-4444-8444-444444444444"}
    ],
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'multiview_to_model',
  files: [
    { type: 'image', file_token: '11111111-1111-4111-8111-111111111111' },
    { type: 'image', file_token: '22222222-2222-4222-8222-222222222222' },
    { type: 'image', file_token: '33333333-3333-4333-8333-333333333333' },
    { type: 'image', file_token: '44444444-4444-4444-8444-444444444444' }
  ],
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

# Texture model (v3.0-20250812)

All supported parameters for `texture_model` when `model_version` is `v3.0-20250812`.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters
### Required parameters
`type`: This field must be set to `texture_model`.

`original_model_task_id`: The `task_id` of previous model, the `model_version` of previous task should be in (`Turbo-v1.0-20250506` or over `v2.0-20240919`). Only the task IDs of the tasks which has **model output** can be used.

> **Note**
> 1.x versions of `text_to_model`, `image_to_model` and `multiview_to_model` tasks are not supported.

`texture_prompt`: The structure can be seem below:
- `text`: A `text` value that directs the texture generation, mutually exclusive with `image` and `images`.
- `image`: A `file` object that directs the texture generation, mutually exclusive with `text` and `images`.
- `images`: A `file` list that directs the texture generation, mutually exclusive with `text` and `image`.
- `style_image` **(Optional)**: A `file` object that allows you to provide a reference image to influence the artistic style of the generated model.

> **File object**
> `file`: Specifies the image input.
> 
> - `type`: Indicates the file type. Although currently not validated, specifying the correct file type is strongly advised.
> - `file_token`: The identifier you get from upload, please refer to part of Upload directly. **Mutually exclusive with `url` and `object`**.
> - `url`: A direct URL to the image. Supports JPEG and PNG formats with a maximum size of 20MB. **Mutually exclusive with `file_token` and `object`**.
> - `object` **(Strongly Recommended)**: The information you get from upload, please refer to [Upload in STS](/file-upload/upload-in-sts.md). **Mutually exclusive with `url` and `file_token`**.
> - `bucket`: Normally it always will be `tripo-data`.
> - `key`: The `resource_uri` from returns.

### Optional parameters
`model_version`: Should be set to `v3.0-20250812`.

`texture`: A `bool` value to enable texturing. The default value is `true`. Set `false` to only update the pbr texture while `pbr`=`true`.

`pbr`: A `bool` value to enable pbr. The default value is `true`. Set `false` to get a model without pbr.

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_alignment`: A `text` value to determine the prioritization of texture alignment in the 3D model. The default value is `original_image`. All available values are:
- `original_image`: Prioritizes visual fidelity to the source image. This option produces textures that closely resemble the original image but may result in minor 3D inconsistencies.
- `geometry`: Prioritizes 3D structural accuracy. This option ensures better alignment with the model’s geometry but may cause slight deviations from the original image appearance.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`part_names`: The `text` list of part names referred from [Mesh segmentation](../mesh-editing/mesh-segmentation-v1-0-20250506.md), the default value will be all part names generated from segmentation.

`compress`: Specifies the compression type to apply to the texture. Available values are:
- `geometry`: Applies geometry-based compression to optimize the output. By default we use meshopt compression

`bake`: A `bool` value. When set to `true`, bakes the model's textures, combining advanced material effects into the base textures. The default value is `true`.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"texture_model","original_model_task_id":"ef731ad6-aeb0-4950-9a2e-2298359dfaf8","texture_prompt":{"text":"weathered bronze armor"},"model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "texture_model",
    "original_model_task_id": "ef731ad6-aeb0-4950-9a2e-2298359dfaf8",
    "texture_prompt": {
        "text": "weathered bronze armor"
    },
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'texture_model',
  original_model_task_id: 'ef731ad6-aeb0-4950-9a2e-2298359dfaf8',
  texture_prompt: {
    text: 'weathered bronze armor'
  },
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

# Texture model (v2.5-20250123)

All supported parameters for `texture_model` when `model_version` is `v2.5-20250123`.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters
### Required parameters
`type`: This field must be set to `texture_model`.

`original_model_task_id`: The `task_id` of previous model, the `model_version` of previous task should be in (`Turbo-v1.0-20250506` or over `v2.0-20240919`). Only the task IDs of the tasks which has **model output** can be used.

> **Note**
> 1.x versions of `text_to_model`, `image_to_model` and `multiview_to_model` tasks are not supported.

`texture_prompt`: The structure can be seem below:
- `text`: A `text` value that directs the texture generation, mutually exclusive with `image` and `images`.
- `image`: A `file` object that directs the texture generation, mutually exclusive with `text` and `images`.
- `images`: A `file` list that directs the texture generation, mutually exclusive with `text` and `image`.
- `style_image` **(Optional)**: A `file` object that allows you to provide a reference image to influence the artistic style of the generated model.

> **File object**
> `file`: Specifies the image input.
> 
> - `type`: Indicates the file type. Although currently not validated, specifying the correct file type is strongly advised.
> - `file_token`: The identifier you get from upload, please refer to part of Upload directly. **Mutually exclusive with `url` and `object`**.
> - `url`: A direct URL to the image. Supports JPEG and PNG formats with a maximum size of 20MB. **Mutually exclusive with `file_token` and `object`**.
> - `object` **(Strongly Recommended)**: The information you get from upload, please refer to [Upload in STS](/file-upload/upload-in-sts.md). **Mutually exclusive with `url` and `file_token`**.
> - `bucket`: Normally it always will be `tripo-data`.
> - `key`: The `resource_uri` from returns.

### Optional parameters
`model_version`: Should be set to `v2.5-20250123`.

`texture`: A `bool` value to enable texturing. The default value is `true`. Set `false` to only update the pbr texture while `pbr`=`true`.

`pbr`: A `bool` value to enable pbr. The default value is `true`. Set `false` to get a model without pbr.

`texture_seed`: An `integer` value chosed randomly if not set. This is the random seed for texture generation for model_version>=`v2.0-20240919` or `Turbo-v1.0-20250506`. Using the same seed will produce identical textures. If you want a model with different textures, please use same `model_seed` and different `texture_seed`.

`texture_alignment`: A `text` value to determine the prioritization of texture alignment in the 3D model. The default value is `original_image`. All available values are:
- `original_image`: Prioritizes visual fidelity to the source image. This option produces textures that closely resemble the original image but may result in minor 3D inconsistencies.
- `geometry`: Prioritizes 3D structural accuracy. This option ensures better alignment with the model’s geometry but may cause slight deviations from the original image appearance.

`texture_quality`: A `text` value to control the texture quality. Can be set to `standard`, `detailed`, or `extreme`. `detailed` provides high-resolution textures, resulting in more refined and realistic representation of intricate parts. `extreme` provides the highest texture resolution and visual fidelity. The default value is `standard`. Additional credits: `standard` `10`, `detailed` `20`, `extreme` `30`.

  Combination rules when `texture_quality` is `detailed` or `extreme`:
  - `texture`=`false`, `pbr`=`false`: Upscales the texture to 4K. PBR material will be removed. Only available for `v3.0-20250812`.
  - `texture`=`false`, `pbr`=`true`: Generates PBR with the current texture.
  - `texture`=`true`, `pbr`=`false`: Regenerates HD texture without PBR.
  - `texture`=`true`, `pbr`=`true`: Regenerates HD texture with PBR.

> **Warning**
> Setting `texture_quality`=`standard` with both `texture`=`false` and `pbr`=`false` is not allowed.

`part_names`: The `text` list of part names referred from [Mesh segmentation](../mesh-editing/mesh-segmentation-v1-0-20250506.md), the default value will be all part names generated from segmentation.

`compress`: Specifies the compression type to apply to the texture. Available values are:
- `geometry`: Applies geometry-based compression to optimize the output. By default we use meshopt compression

`bake`: A `bool` value. When set to `true`, bakes the model's textures, combining advanced material effects into the base textures. The default value is `true`.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"texture_model","original_model_task_id":"ef731ad6-aeb0-4950-9a2e-2298359dfaf8","texture_prompt":{"text":"weathered bronze armor"},"model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "texture_model",
    "original_model_task_id": "ef731ad6-aeb0-4950-9a2e-2298359dfaf8",
    "texture_prompt": {
        "text": "weathered bronze armor"
    },
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'texture_model',
  original_model_task_id: 'ef731ad6-aeb0-4950-9a2e-2298359dfaf8',
  texture_prompt: {
    text: 'weathered bronze armor'
  },
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

## MESH SEGMENTATION:

# Mesh segmentation

All supported parameters for `mesh_segmentation`.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters
### Required parameters
`type`: This field must be set to `mesh_segmentation`.

`original_model_task_id`: The `task_id` of previous model, the `model_version` of previous task should be in (`Turbo-v1.0-20250506` or over `v2.0-20240919`). Only the task IDs of the tasks which has **model output** can be used.

> **Note**
> 1.x versions of `text_to_model`, `image_to_model` and `multiview_to_model` tasks are not supported.

### Optional parameters
`model_version`: Set to `v1.0-20250506`.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"mesh_segmentation","original_model_task_id":"ef731ad6-aeb0-4950-9a2e-2298359dfaf8","model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "mesh_segmentation",
    "original_model_task_id": "ef731ad6-aeb0-4950-9a2e-2298359dfaf8",
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'mesh_segmentation',
  original_model_task_id: 'ef731ad6-aeb0-4950-9a2e-2298359dfaf8',
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

## MESH COMPLETION:

# Mesh completion

All supported parameters for `mesh_completion`.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters
### Required parameters
`type`: This field must be set to `mesh_completion`.

`original_model_task_id`: The `task_id` of previous model, the `model_version` of previous task should be in (`Turbo-v1.0-20250506` or over `v2.0-20240919`). Only the task IDs of the tasks which has **model output** can be used.

> **Note**
> 1.x versions of `text_to_model`, `image_to_model` and `multiview_to_model` tasks are not supported.
> **Note**
> The model should be handled by [mesh-segmentation](./mesh-segmentation-v1-0-20250506) before.

### Optional parameters
`model_version`: Set to `v1.0-20250506`.

`part_names`: The list of part names referred from [mesh-segmentation](./mesh-segmentation-v1-0-20250506.md), the default value will be all part names generated from segmentation.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"mesh_completion","original_model_task_id":"ef731ad6-aeb0-4950-9a2e-2298359dfaf8","part_names":["head","body"],"model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "mesh_completion",
    "original_model_task_id": "ef731ad6-aeb0-4950-9a2e-2298359dfaf8",
    "part_names": ["head", "body"],
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'mesh_completion',
  original_model_task_id: 'ef731ad6-aeb0-4950-9a2e-2298359dfaf8',
  part_names: ['head', 'body'],
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

## SMART LOW POLY:

# Smart low poly

All supported parameters for `highpoly_to_lowpoly`.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters
### Required parameters
`type`: This field must be set to `highpoly_to_lowpoly`.

`original_model_task_id`: The `task_id` of previous model, the `model_version` of previous task should be in (`Turbo-v1.0-20250506` or over `v2.0-20240919`). Only the task IDs of the tasks which has **model output** can be used.

> **Note**
> 1.x versions of `text_to_model`, `image_to_model` and `multiview_to_model` tasks are not supported.

`quad`: A `bool` value, set `true` to enable quad mesh output. If `quad`=`true` and `face_limit` is not set, `face_limit` will default to **10000**. Recommended not to exceed **150,000**. This will cost `5` additional credits when set to `true`.
> **Note**
> Enabling this option will force the output to be an FBX model.

### Optional parameters
`model_version`: Set to `P-v2.0-20251225`.

`part_names`: The list of part names referred from [mesh-segmentation](./mesh-segmentation-v1-0-20250506.md), the default value is empty list.

`face_limit`: A `integer` value which determines the target face count of the model during generation, range should be set from **500** to **20000**. When `quad` is `true`, the range should be set from **500** to **10000**.

`bake`: A `bool` value, when set to `true`, the model will be baked when generation. The default value is `true`.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"highpoly_to_lowpoly","original_model_task_id":"ef731ad6-aeb0-4950-9a2e-2298359dfaf8","face_limit":5000,"model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "highpoly_to_lowpoly",
    "original_model_task_id": "ef731ad6-aeb0-4950-9a2e-2298359dfaf8",
    "face_limit": 5000,
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'highpoly_to_lowpoly',
  original_model_task_id: 'ef731ad6-aeb0-4950-9a2e-2298359dfaf8',
  face_limit: 5000,
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

## ANIMATION:

# PRE RIG CHECK:

# Pre rig check

All supported parameters for `animate_prerigcheck`.

`riggable`: `true` means it can be rigged, `false` means it cannot be rigged.

`rig_type`: Available values are `biped`, `quadruped`, `hexapod`, `octopod`, `avian`, `serpentine`, `aquatic`.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters
### Required parameters
`type`: This field must be set to `animate_prerigcheck`.

`original_model_task_id`: The `task_id` of previous model, the `model_version` of previous task should be in (`Turbo-v1.0-20250506` or over `v2.0-20240919`). Only the task IDs of the tasks which has **model output** can be used.

> **Note**
> 1.x versions of `text_to_model`, `image_to_model` and `multiview_to_model` tasks are not supported.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"animate_prerigcheck","original_model_task_id":"ef731ad6-aeb0-4950-9a2e-2298359dfaf8","model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "animate_prerigcheck",
    "original_model_task_id": "ef731ad6-aeb0-4950-9a2e-2298359dfaf8",
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'animate_prerigcheck',
  original_model_task_id: 'ef731ad6-aeb0-4950-9a2e-2298359dfaf8',
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

# RIGGING:

# Rig (v2.5-20260210)

All supported parameters for `animate_rig` when `model_version` is `v2.5-20260210`.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters
### Required parameters
`type`: This field must be set to `animate_rig`.

`original_model_task_id`: The `task_id` of previous model, the `model_version` of previous task should be in (`Turbo-v1.0-20250506` or over `v2.0-20240919`). Only the task IDs of the tasks which has **model output** can be used.

> **Note**
> 1.x versions of `text_to_model`, `image_to_model` and `multiview_to_model` tasks are not supported.

### Optional parameters
`out_format`: The `text` value of the file format. This parameter can only be `glb` or `fbx`, and if it is not given, the default value is `glb`.

`model_version`: Set to `v2.5-20260210`.

`rig_type`: The `text` value specifies the skeletal rig type to be applied to the model. The default value is `biped`.

`spec`: Specifies the rigging method to be used. Available options are `mixamo` and `tripo`. The default value is `tripo`. Only `tripo` is supported for retarget.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"animate_rig","original_model_task_id":"ef731ad6-aeb0-4950-9a2e-2298359dfaf8","rig_type":"biped","model_version":"<use_the_model_version_in_this_page>"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "animate_rig",
    "original_model_task_id": "ef731ad6-aeb0-4950-9a2e-2298359dfaf8",
    "rig_type": "biped",
    "model_version": "<use_the_model_version_in_this_page>"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'animate_rig',
  original_model_task_id: 'ef731ad6-aeb0-4950-9a2e-2298359dfaf8',
  rig_type: 'biped',
  model_version: '<use_the_model_version_in_this_page>'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

# RETARGET:

# Retarget

All supported parameters for `animate_retarget`.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters
### Required parameters
`type`: This field must be set to `animate_retarget`.

`original_model_task_id`: The `task_id` of previous model, the `model_version` of previous task should be in (`Turbo-v1.0-20250506` or over `v2.0-20240919`). Only the task IDs of the tasks which has **model output** can be used.

> **Note**
> 1.x versions of `text_to_model`, `image_to_model` and `multiview_to_model` tasks are not supported.

### Optional parameters
`out_format`: The file format. This parameter can only be `glb` or `fbx`, and if it is not given, the default value is `glb`.

`bake_animation`: Determines whether to bake the animation into the model upon output. The default value is `true`. Can only be implemented on `glb` model.

`export_with_geometry`: Determines whether to include geometry in the output. The default value is `true`.

`animation`: The preset animation. Available values are as follows:

`preset:idle` · `preset:walk` · `preset:run` · `preset:dive` · `preset:climb` · `preset:jump` · `preset:slash` · `preset:shoot` · `preset:hurt` · `preset:fall` · `preset:turn` · `preset:quadruped:walk` · `preset:hexapod:walk` · `preset:octopod:walk` · `preset:serpentine:march` · `preset:aquatic:march`

`animate_in_place`: A bool to determine if the model will be animated in fixed place. The default value is `false`.

`animations`: An array of preset animations. Each element should be one of the preset values listed above. Length cannot be over **5**.

> One of `animation` or `animations` must be set.

## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"animate_retarget","original_model_task_id":"ef731ad6-aeb0-4950-9a2e-2298359dfaf8","animation":"preset:walk"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "animate_retarget",
    "original_model_task_id": "ef731ad6-aeb0-4950-9a2e-2298359dfaf8",
    "animation": "preset:walk"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'animate_retarget',
  original_model_task_id: 'ef731ad6-aeb0-4950-9a2e-2298359dfaf8',
  animation: 'preset:walk'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

## CONVERSION[EXPORT]:

# Conversion

All supported parameters for `conversion`. This task is version-independent and available across all model versions.

## Endpoint

`POST https://api.tripo3d.ai/v2/openapi/task`

## Parameters
### Required parameters
`type`: This field must be set to `convert_model`.

`format`: Converts `glb` format models from the OpenAPI into other formats. It can only be one of the following values.
  - `GLTF`: Transforms into GLTF format.
  - `USDZ`: Transforms into USDZ format.
  - `FBX`: Transforms into FBX format.
  - `OBJ`: Transforms into OBJ format. Not supported with rigged models.
  - `STL`: Transforms into STL format. Not supported with rigged models.
  - `3MF`: Transforms into 3MF format. Not supported with rigged models and only exports geometry.

> **Notes**
> - `GLTF` and `STL` don't support storing quad faces — enabling `quad` will still perform retopology and apply face limit, but the result will store all faces as triangles.
> - Textures will not be retained in the final model when choosing `STL`.
> - If you need to perform a format conversion after an initial one, only the `format` parameter will be supported.

`original_model_task_id`: The `task_id` of previous model, the `model_version` of previous task should be in (`Turbo-v1.0-20250506` or over `v2.0-20240919`). Only the task IDs of the tasks which has **model output** can be used.

> **Note**
> 1.x versions of `text_to_model`, `image_to_model` and `multiview_to_model` tasks are not supported.

### Optional parameters
`quad`: When set to `true`, enables quad remeshing (or auto retopology) for the converted model.

`force_symmetry`: A `bool` value which is effective only when `quad` is enabled. Force symmetry for quad remeshing.

`face_limit`: An `integer` value which limits the number of faces on the output model. The default value is **10000**.

`flatten_bottom`: When set to `true`, enables flatten the bottom of converted model. The default value is `false`.

`flatten_bottom_threshold`: A `float` value which is effective only when `flatten_bottom` is **enabled**. Set the bottom flatten depth. The default value is `0.01`.

`texture_size`: An `integer` value to set the diffuse color texture size (in pixel). The default value is **2048**(**4096** for `model_version`>=`v2.0-20240919`), and should be smaller than the default value.

`texture_format`: A `text` value to set the diffuse color texture format (supports `BMP`, `DPX`, `HDR`, `JPEG`, `OPEN_EXR`, `PNG`, `TARGA`, `TIFF`, `WEBP`). The default value is `JPEG`(The Default value for `FBX` is `PNG` to better support unity).

`pivot_to_center_bottom`: A `bool` value to set the pivot point to center bottom. The default value is `false`.

`scale_factor`: A `number` value to set the object scale. The default value is **1**.

`with_animation`: When set to `true`, the exported model will include skeletal binding information and animation structure. The default value is `true`.

`pack_uv`: When set to `true`, combine all UV islands from different parts into one unified layout and export a single texture map. The default value is `false`.

`bake`: When set to `true`, bakes the model's textures, combining advanced material effects into the base textures. The default value is `true`.

`part_names`: A `list` value of part names referred from [mesh segmentation](../mesh-editing/mesh-segmentation-v1-0-20250506.md).

`animate_in_place`: A `bool` value to determine if the model will be animated in fixed place. The default value is `false`.

`export_vertex_colors`: A `bool` value that controls whether to include vertex colors when exporting. Only can be used when `OBJ` or `GLTF` is selected in format. The default value is `false`.

`export_orientation`: A `text` to set the model facing direction. The default value is `+x` (supports `-x`, `-y`, `+y`).

`fbx_preset` (experimental): A `text` to specify the target platform for fbx export compatibility. The default value is `blender` (supports `3dsmax`, `mixamo`).


## Returns

`task_id`: The identifier for the successfully submitted task.


## Code Examples


`POST https://api.tripo3d.ai/v2/openapi/task`

```bash
export APIKEY="tsk_***"
curl -X POST 'https://api.tripo3d.ai/v2/openapi/task' -H 'Content-Type: application/json' -H "Authorization: Bearer ${APIKEY}" -d '{"type":"conversion","original_model_task_id":"ef731ad6-aeb0-4950-9a2e-2298359dfaf8","format":"FBX"}'
unset APIKEY
```
```python
import requests

api_key = "tsk_***"
url = "https://api.tripo3d.ai/v2/openapi/task"

data = {
    "type": "conversion",
    "original_model_task_id": "ef731ad6-aeb0-4950-9a2e-2298359dfaf8",
    "format": "FBX"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

response = requests.post(url, headers=headers, json=data)

print(response.json())
```
```js
const apiKey = 'tsk_***'
const url = 'https://api.tripo3d.ai/v2/openapi/task'

const data = {
  type: 'convert_model',
  original_model_task_id: 'ef731ad6-aeb0-4950-9a2e-2298359dfaf8',
  format: 'FBX'
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  },
  body: JSON.stringify(data)
}

fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ', info: ' + response.statusText)
    }
    return response.json()
  })
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```

```json
{
  "code": 0,
  "data": {
     "task_id": "1ec04ced-4b87-44f6-a296-beee80777941"
   }
}
```

