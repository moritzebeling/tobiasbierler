export function getProject( projects, url ){
    let project;
    for (let i = 0; i < projects.length; i++) {
        if( projects[i].url === url ){
            project = projects[i];
            break;
        }
    }
    return project;
}
