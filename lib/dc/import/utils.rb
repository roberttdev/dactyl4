module DC
  module Import

    module Utils

      def self.read_ascii(path)
        Iconv.iconv('ascii//translit//ignore', 'utf-8', File.read(path)).first
      end

      def self.save_page_images(asset_store, document, page_number, filename, access)
        asset_store.save_page_images(document, page_number,
          {'normal'     => "images/700x/#{filename}",
           'large'      => "images/1400x/#{filename}",
           'small'      => "images/180x/#{filename}",
           'thumbnail'  => "images/60x75!/#{filename}"},
          access
        )
      end

    end

  end
end