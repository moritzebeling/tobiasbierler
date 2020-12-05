<?php

class File {

    protected $url;
    protected $path;
    protected $name;
    protected $filename;
    protected $extension;

    public function __construct( $url )
    {

        $this->url = $url;

        $parts = explode( DS, $url );

        $this->filename = array_pop( $parts );
        $this->path = implode( DS, $parts );

        $parts = explode( '.', $this->filename );

        $this->extension = array_pop( $parts );
        $this->name = implode( '.', $parts );

        $this->data();

    }

    public function url(): string {
        return $this->url;
    }

    public function path(): string {
        return $this->path;
    }

    public function name(): string {
        return $this->name;
    }

    public function data(): array {
        $this->data = [];

        $path = $this->path() . DS . $this->name() . '.json';
        if( file_exists( $path ) ){

            $string = file_get_contents( $path );
            $this->data = json_decode( $string, TRUE );

        }

        return $this->data;
    }

    public function filename(): string {
        return $this->filename;
    }

    public function extension(): string {
        return $this->extension;
    }

    public function title(): string {

        if( array_key_exists( 'title', $this->data ) ){
            return $this->data['title'];
        }

        $parts = explode( '_', $this->name() );
        if( count( $parts ) > 1 ){
            array_shift( $parts );
        }
        foreach( $parts as $i => $part ){
            $parts[$i] = ucfirst( str_replace('-',' ',$part) );
        }
        return implode(' ', $parts);
    }

    public function toArray(): array {
        return array_merge( $this->data, [
            // 'src' => str_replace( 'content/', '', $this->url() ),
            'path' => $this->path(),
            'filename' => $this->filename(),
            'alt' => $this->title()
        ]);
    }

}
