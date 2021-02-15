export function imageIndex( portfolio ){
    let images = [];
    for( const project of portfolio.pages.reverse() ){
        for (let i = 0; i < project.images.length; i++){
            images.push({ ...project.images[i],
                project: project.title,
                href: project.url + '/' + (i+1)
            });
        }
    }
    return images;
}
