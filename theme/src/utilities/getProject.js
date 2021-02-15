function num( i, l ){
    let n = `00${l-i}`;
    return n.substr(-2);
}

export function getProject( projects, url ){
    let project;
    for (let i = 0; i < projects.length; i++) {
        if( projects[i].url === url ){
            project = projects[i];
            project['n'] = num(i,projects.length);
            break;
        }
    }
    return project;
}
