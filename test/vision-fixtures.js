function makeVisionsArray() {
    return [
        {
          id: 1,
          vision_image: "https://bit.ly/2YZHxXL",
          vision_category: 'Decor',
          vision_room: 'Master Bedroom',
          note: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
          link: 'http://loripsum.net/'  
          },
          {
            id: 2,
            vision_image: "https://bit.ly/2xX11jG",
            vision_category: 'Paint color',
            vision_room: 'Kitchen',
            note: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
            link: 'http://loripsum.net/'
          },
          {
            id: 3,
            vision_image: "https://bit.ly/2M2VEYB",
            vision_category: 'Lighting',
            vision_room: 'Office',
            note: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
            link: 'http://loripsum.net/'
          },
          {
            id: 4,
            vision_image: "https://bit.ly/2XUTEnC",
            vision_category: 'Cabinets',
            vision_room: 'Kitchen',
            note: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
            link: 'http://loripsum.net/'
          }
    ]
}

function makeMaliciousVision() {
  const maliciousVision = {
    id: 911,
    vision_image: 'https://bit.ly/2LYn9T3',
    vision_category: 'Misc',
    vision_room: 'Office',
    note: 'Naughty naughty very naughty <script>alert("xss");</script>',
    link: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  }
  const expectedVision = {
    ...maliciousVision,
    note: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    link: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousVision,
    expectedVision,
  }
}

module.exports = {
    makeVisionsArray,
    makeMaliciousVision
}