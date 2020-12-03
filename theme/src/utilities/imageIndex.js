function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function imageIndex( portfolio ){
    let images = [];
    for( const project of portfolio.pages ){
        for (let i = 0; i < project.images.length; i++){
            images.push({ ...project.images[i],
                project: project.title,
                href: i === 0 ? project.url : project.url + '#' + i
            });

        }
    }
    return shuffle( images );
}
