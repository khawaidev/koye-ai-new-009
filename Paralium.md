### THIS A NEW SUPER AGENTIC FEATURE CALLED PARALIUM[another mode like fast, auto etc, also can be selected in the mode selection, add it just below auto]:

#MODELS INVOLVED HERE:

from gemini api key

- gemini-3.1-flash-lite

 - gemini-3-flash

 - gemini-3.5-flash
- these above models are for chatting with users, keeping other advnaced models running in loosps, reporting errors to coding models, until the first playable game is ready
- routing order for paralium chat and reference-game lookup should stay on the gemini api key chain only:
  gemini-3.1-flash-lite -> gemini-3-flash -> gemini-3.5-flash
- gemini-3-flash and gemini-3.5-flash should only be used if gemini-3.1-flash-lite is rate limited for the current minute or day

from laysoai api key:

 - opus 4.7 thinking (full end to end, first playable game prototype planning, hightly detailed md file)
 - claude sonnet 4.5 [full game coding, debugging, fixing errors,etc]

 - claude-sonnet-4-5-20250929-thinking [asset generation tasks, for generating high quality, detailed text prompt for generating the images, 3d models, video, audio, etc] (while you're implementing this features, also make a separate guide file for this on how to genrate hight qualty prompts in the file should also contain guides on how to generated quality prompt for eah type of assets, this guide file should be very detailed, and also another guide file on how to auto rig with tripo and then 3d animation with tripo api)

from skillboss api:

 - gpt-5.1 (advanced game screen images analysis, and providing descriptions with high precision)

WHAT THIS DOES: It is a pure end to end agentic feature for game building, user describes game idea -> chatting models[gemini-3.1-flash-lite(if rate limit),gemini-3-flash(if rate limit),gemini-3.5-flash](from gemini api key):1.analyses the idea, comes up with related question for the game, questions which are needed to build a first prototype playable game, once user answers the first batch of questions, then according to the users answers, come up with another batch of questions related to the ideas, and then once user answers these questions -> then come up with another batch of question do this until the ai thinks that it has enough information to build a first prototype playable game, then structure the info collected, organise it and then save it in the users project folder in a file named plan.md

[Here the real agentic tasks starts: the ai should understnd that it needs more the similar games the user describes -> takes reference from similar game and build around it, search up the game play screen of similar games, mechanics, ui, characters, items, enviroment etc]

2.the ai should come up with three famous well know game in the category/type the game user describes[should come up with the three game names]

3.ai should auto trigger the bing image search using these tags[first for one game only, first name] the seach should be indexed to pintrest and game ui database sies, like the search feature in mediagen page's indexed image seach feature:

[game] splash screen
[game] loading screen
[game] main menu screen
[game] lobby screen
[game] character selection screen
[game] gameplay HUD
[game] battle UI
[game] pause menu
[game] victory screen
[game] defeat screen
[game] reward screen
[game] settings screen

[THESE SEARCHES SHOULD BE DONE IN PARALELL TO SAVE TIME, and then pick 3 from each category and then, show it to the user in the chatting interface,searching complete, 'Pick the game screens that you want it in your game similarly, these screens can always be edited to your ideas and needs.' and then below this txt ui, then an a rectangular btn with slightly rounded btns with txt: Choose game screens that are similar to your ideas. ] - which when clicked by the user then a new pop up element[an image rendering pop up, to show the images searched up before, should occupy 80% of the screen's height and width, the images should be displayed in a horizontal carousals, like 

here in the below searches save the 20 searched images for each type of screens, even tho only 5 ecah is shown[this is to be used when the user clicks the serach more btn], save these images inthe user temp item in the browser, we'll call this ss-image-screens

(in the left top corner txt, Choose your game screen ideas)

Splash screen

[here image-1] [here image-2] [here image-3] [here image-4] [here image-5] (from the same search)

Loading screen

[here image-1] [here image-2] [here image-3] [here image-4] [here image-5] (from the same search)

main menu screen

[here image-1] [here image-2] [here image-3] [ here image-4] [here image-5] (from the same search)

lobby screen

[here image-1] [here image-2] [here image-3] [ here image-4] [here image-5] (from the same search)

character selection screen

[here image-1] [here image-2] [here image-3] [ here image-4] [here image-5] (from the same search)



and then so 

in the image images's elements, there should be a cicular select/tick icon[which fills when selected], in the top right corner of each image's, all these above images should be rendered in its ratio ,like if its rectangle then rectangle etc, no container will alter its original ration, although the scale should be all the same of all the iamges rendered here
]
the above pop up image selection should be with overflow y[slim, and should be scrolable to the settings screen's images]

at the right top corner of the pop up element add a btn with txt: Search more designs screens.[which when clicked the app should trigger another search with the second game[here the initail pop up image selection should close](initially it generated 3 game names), and then if clicked again then search for the third game name. here if it reached three times then, change the btns txt to Desribe idea clearly again(which when clicked then close the pop up , then in the chat session the user prev opened auto send a user request msz with message txt i want to describe my game idea clearly again)], but if the user selected a few images and then hit the seach more btn then the search for the non selected iamge screen category is only scearched and shown inplace of the  not selected images, inpace of that the ss-image-screens are shown

at the bottom right corner of the pop up image selection add a Complete btn[which is clickable when the user chooses an image for each category(user can choose only one per tag/category)]

- here its is compulsory for the user to choose one each for each tag/category

- after clicked the Complete btn then close the image selection pop up , and submit the selected images[but the filenames of the selected images should be renamed as the tags/type screen name , like splash.png, loading.png etc for each screens images] to the gpt-5.1[from skillboss api], (but when implementing all these features, generate a guide file for the image understanding and describing model, this file should contain how to understand the images, describe super detailed of each types of images: types:
-  splash screen
-  loading screen
-  main menu screen
-  lobby screen
-  character selection screen
-  gameplay HUD
 battle UI
 pause menu
 victory screen
 defeat screen
 reward screen, buttons, etc every element in the image screen
settings screen, generate guides on how to understand and generate the descriptions of each type of these images,name this guide file as guide-for-game-image-screens.md, this guide should also say to the model that the description should be detailed as the described txt is used to generate the same ui with some edits to it, the descriptions should also contain each and evey descriptions of the elements within the images not missing even one, this file should be submitted to the model for each and every request,and then the model should ouptput a structured md style response{like : splash screen: scene descriotion, loading.. and so on} )

- if these above are done then:

- submit the first user-ai chat interaction result data[the structured info the chatting ai got out of the user when describing ideas] and the images description output txt to claude opus 4.7 thinking for generating the full game ready end to end first prototype playable game plan md file, should be super defined and detailed with the overviews, required assets, scene by scene flow of the game, game mechanics, logics, loops[if any], etc and mcuh more [here while you're implementing these features , generate a super long guide for the opus 4.7 thinking model to generate the end to end plan for building a first playable game prototype, this guide should say everything needed to generate the plan, name guide-for-generating-game-plan.md, and in this guide file also should tell the model to generate the full response in a md file format, should also tell the opus 4.7 that the web app supports agents calling tools like 3d models generation(from text and images), audio generation(sound effects, music, voicelines from text as input), video generation(from txt and image), auto rigging for 3d models, animations generation for 3d models[bi pad, Quadruped, Hexapod, Octopod, Avian, Serpentine, Aquatic ]]

- if these is done then:

- submit the full game plan md txt to opus 4.7 thinking and ask it to break it down into tasks, 1,2...etc each tasks should contain , goals, whats to be done , steps and steps should contain, substeps which should also be numbered, also should add label to each tasks as types like: coding, asset generation[includes:images-gen,video-gen,3dmodels-gen,auto-rigging,animations3d,audio-gen], and also to output the response in structured with clear label which prompt is which, and the output should be in md format , and also here should also say which type of 3d animations are requried [for the first playable game prototype, here are the available aniamtions:preset:idle
preset:walk
preset:run
preset:dive
preset:climb
preset:jump
preset:slash
preset:shoot
preset:hurt
preset:fall
preset:turn
preset:quadruped:walk
preset:hexapod:walk
preset:octopod:walk
preset:serpentine:march
preset:aquatic:march]

- if these is done then:
- THEN HERE STARTS THE PURE PARALLELE AGENTIC WORKING:

- For the coding tasks/game coding: hand over the tasks to:

- submit the full game plan md file to the claude sonnet 4.5 model- while implementing these features you generate the guide for this coding model[this should also be like a multi prompt guide, but more more super detailed for generating game code files,first the model should undersstand the whole plan and then generate tasks 1,2,3 with task names and purposes, like task 1 creting the required code filist, etc should also tell the model to understand the game plan first and generate the  filist required for the game, and then files which are to generate first and then so on..., and also other guide for coding the game files for babylon js engine(not for other engines)] and should run unti each task is done, when a task is done then auto trigger[a new request to the coding model]  for next task, the model should not move on unti task is done and output files are generted and saved.

- At the same time[in parallel with the coding tasks] for the assets generation tasks:

- submit the required assets for the game to claude-sonnet-4-5-20250929-thinking to generate the text prompt for the assets generations[should follow the geneation guide file] and then also along with it submit the users game idea[the refined, structured output fo the idea], and then if the response is done then, the web app[the system]  should separate the text prompts from the response's label[the response includes all the prompts of the assets, not just one , so the system should separate which is which by task type in the responses label]

- and then of the generation of the text prompt and the separation of each is done then:

- send the request to the respective api's for the task types [2d image gen, video gen, 3d models gen, auto rigging, animations 3d, audio gen]
 for 3d- tripo api,
 for 2d images - runwayml api
 for audio and its types - elleven labs
 for 3d animations and rigging - tripo api

 - these required tasks should be done in parallel but if one generation tasks requires to use the same api provider then should queue the requests, these parallel tasks should be shown in the tasks tab [left sidebar] with thier respective status in real time like, queue.

- if all these generation and coding is done then auto run the game in the builder page, should open the render page auto matically,if any error then auto send to the sonnet 4.5 model to fix it then repeat -> auto run -> if error again if it until no error, then the game is ready for the user to play and test,


and in all these above if one tasks/request fails then a notification should be shown to the user with the error msz and a retry btn[which should retry the specific tasks]

and if all this runs sucessfully then the ai should generate the recommended next things to add.to the user in the chatting interface









