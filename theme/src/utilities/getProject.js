function getPrev( project ){
    let i = project.images.length - 1;
    return project.url + '#' + i;
}
function getNext( project ){
    return project.url;
}

export function getProject( projects, url ){
    let project;
    for (let i = 0; i < projects.length; i++) {
        if( projects[i].url === url ){
            project = projects[i];
            project['prev'] = getPrev( i > 0 ? projects[i-1] : projects[projects.length-1] );
            project['next'] = getNext( i < projects.length-1 ? projects[i+1] : projects[0] );
            break;
        }
    }
    return project;
}
